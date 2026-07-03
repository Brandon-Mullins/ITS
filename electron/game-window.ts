import { execFile } from 'child_process';
import { promisify } from 'util';
import { screen } from 'electron';
import type { BrowserWindow } from 'electron';

const execFileAsync = promisify(execFile);

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameWindowInfo {
  found: boolean;
  title: string;
  bounds: WindowBounds | null;
  processId: number | null;
}

const RS3_TITLE_PATTERNS = [/runescape/i, /jagex.*nxt/i];
const EXCLUDE_PATTERNS = [
  /quest helper/i,
  /devtools/i,
  /visual studio/i,
  /cursor/i,
  /jagex launcher/i,
  /launcher/i,
];

const POWERSHELL_SCRIPT = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Collections.Generic;
public class Win32 {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
  public static List<object[]> GetWindows() {
    var results = new List<object[]>();
    EnumWindows((hWnd, lParam) => {
      if (!IsWindowVisible(hWnd) || IsIconic(hWnd)) return true;
      var sb = new StringBuilder(256);
      GetWindowText(hWnd, sb, 256);
      var title = sb.ToString();
      if (string.IsNullOrWhiteSpace(title)) return true;
      RECT r;
      GetWindowRect(hWnd, out r);
      uint pid;
      GetWindowThreadProcessId(hWnd, out pid);
      results.Add(new object[] { title, r.Left, r.Top, r.Right - r.Left, r.Bottom - r.Top, (int)pid });
      return true;
    }, IntPtr.Zero);
    return results;
  }
}
"@
$windows = [Win32]::GetWindows()
$windows | ForEach-Object { "$($_[0])|$($_[1])|$($_[2])|$($_[3])|$($_[4])|$($_[5])" }
`;

function matchesRs3(title: string): boolean {
  if (EXCLUDE_PATTERNS.some((p) => p.test(title))) return false;
  return RS3_TITLE_PATTERNS.some((p) => p.test(title));
}

export async function findGameWindow(): Promise<GameWindowInfo> {
  if (process.platform !== 'win32') {
    return { found: false, title: '', bounds: null, processId: null };
  }

  try {
    const { stdout } = await execFileAsync(
      'powershell',
      ['-NoProfile', '-NonInteractive', '-Command', POWERSHELL_SCRIPT],
      { timeout: 10000, maxBuffer: 10 * 1024 * 1024 },
    );

    const candidates: GameWindowInfo[] = [];

    for (const line of stdout.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const parts = trimmed.split('|');
      if (parts.length < 6) continue;

      const title = parts[0];
      if (!matchesRs3(title)) continue;

      const x = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      const width = parseInt(parts[3], 10);
      const height = parseInt(parts[4], 10);
      const processId = parseInt(parts[5], 10);

      // RS3 client is never tiny — skip launcher popups etc.
      if (width < 640 || height < 480) continue;

      candidates.push({
        found: true,
        title,
        bounds: { x, y, width, height },
        processId,
      });
    }

    candidates.sort((a, b) => {
      const aExact = /^runescape$/i.test(a.title) ? 1 : 0;
      const bExact = /^runescape$/i.test(b.title) ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
      const aArea = (a.bounds?.width ?? 0) * (a.bounds?.height ?? 0);
      const bArea = (b.bounds?.width ?? 0) * (b.bounds?.height ?? 0);
      return bArea - aArea;
    });

    return candidates[0] ?? { found: false, title: '', bounds: null, processId: null };
  } catch {
    return { found: false, title: '', bounds: null, processId: null };
  }
}

const OVERLAY_WIDTH = 380;
const ATTACH_POLL_MS = 500;

function computeOverlayBounds(
  game: WindowBounds,
  overlayWidth: number,
  preferredHeight: number,
): WindowBounds {
  const display = screen.getDisplayMatching({
    x: game.x + Math.floor(game.width / 2),
    y: game.y + Math.floor(game.height / 2),
    width: 1,
    height: 1,
  });

  const work = display.workArea;
  const overlayHeight = Math.min(Math.max(preferredHeight, 400), work.height - 16, 900);

  // Try right side first
  let x = game.x + game.width + 8;
  let y = game.y;

  // If off right edge, dock to left of game
  if (x + overlayWidth > work.x + work.width) {
    x = game.x - overlayWidth - 8;
  }

  // If still off-screen (fullscreen), float inside game on the right
  if (x < work.x) {
    x = game.x + game.width - overlayWidth - 12;
  }

  // Clamp within monitor work area
  x = Math.max(work.x, Math.min(x, work.x + work.width - overlayWidth));
  y = Math.max(work.y, Math.min(y, work.y + work.height - overlayHeight));

  return { x, y, width: overlayWidth, height: overlayHeight };
}

export class GameWindowTracker {
  private attached = false;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private lastGameInfo: GameWindowInfo | null = null;
  private savedBounds: WindowBounds | null = null;

  constructor(private overlayWindow: BrowserWindow) {}

  isAttached(): boolean {
    return this.attached;
  }

  getLastGameInfo(): GameWindowInfo | null {
    return this.lastGameInfo;
  }

  attach(): void {
    if (this.attached) return;

    // Save position so detach can restore it
    const current = this.overlayWindow.getBounds();
    this.savedBounds = {
      x: current.x,
      y: current.y,
      width: current.width,
      height: current.height,
    };

    this.attached = true;
    void this.poll();
    this.pollTimer = setInterval(() => void this.poll(), ATTACH_POLL_MS);
  }

  detach(): void {
    this.attached = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.lastGameInfo = null;

    if (this.savedBounds && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.setBounds(this.savedBounds);
      this.overlayWindow.setAlwaysOnTop(true);
      this.overlayWindow.show();
      this.savedBounds = null;
    }
  }

  private async poll(): Promise<void> {
    if (!this.attached || this.overlayWindow.isDestroyed()) return;

    const info = await findGameWindow();
    this.lastGameInfo = info;

    if (!info.found || !info.bounds) return;

    const bounds = computeOverlayBounds(info.bounds, OVERLAY_WIDTH, info.bounds.height);

    this.overlayWindow.setBounds(bounds);
    this.overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    if (!this.overlayWindow.isVisible()) {
      this.overlayWindow.show();
    }
    this.overlayWindow.moveTop();
  }
}
