import { execFile } from 'child_process';
import { promisify } from 'util';
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
const EXCLUDE_PATTERNS = [/quest helper/i, /devtools/i, /visual studio/i, /cursor/i];

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
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
  public static List<object[]> GetWindows() {
    var results = new List<object[]>();
    EnumWindows((hWnd, lParam) => {
      if (!IsWindowVisible(hWnd)) return true;
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

      if (width < 200 || height < 200) continue;

      candidates.push({
        found: true,
        title,
        bounds: { x, y, width, height },
        processId,
      });
    }

    // Prefer exact "RuneScape" title, then largest window
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
const ATTACH_POLL_MS = 400;

export class GameWindowTracker {
  private attached = false;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private lastGameInfo: GameWindowInfo | null = null;

  constructor(private overlayWindow: BrowserWindow) {}

  isAttached(): boolean {
    return this.attached;
  }

  getLastGameInfo(): GameWindowInfo | null {
    return this.lastGameInfo;
  }

  attach(): void {
    if (this.attached) return;
    this.attached = true;
    this.poll();
    this.pollTimer = setInterval(() => this.poll(), ATTACH_POLL_MS);
  }

  detach(): void {
    this.attached = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.lastGameInfo = null;
  }

  private async poll(): Promise<void> {
    if (!this.attached || this.overlayWindow.isDestroyed()) return;

    const info = await findGameWindow();
    this.lastGameInfo = info;

    if (!info.found || !info.bounds) return;

    const { x, y, width, height } = info.bounds;
    const overlayHeight = Math.min(Math.max(height, 400), 900);
    const overlayX = x + width + 4;
    const overlayY = y;

    // Keep overlay on screen
    const clampedX = Math.max(0, overlayX);
    const clampedY = Math.max(0, overlayY);

    this.overlayWindow.setBounds({
      x: clampedX,
      y: clampedY,
      width: OVERLAY_WIDTH,
      height: overlayHeight,
    });
  }
}
