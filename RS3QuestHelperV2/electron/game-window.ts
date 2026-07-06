import { execFile } from 'child_process';
import { promisify } from 'util';
import { screen } from 'electron';
import type { BrowserWindow } from 'electron';
import { syncHighlightToGame } from './highlight-overlay';

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
  hwnd: number | null;
}

const RS3_TITLE_PATTERNS = [/runescape/i, /jagex.*nxt/i];
const EXCLUDE_PATTERNS = [
  /quest helper/i,
  /devtools/i,
  /visual studio/i,
  /cursor/i,
  /jagex launcher/i,
  /launcher/i,
  /chrome/i,
  /firefox/i,
  /edge/i,
  /brave/i,
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
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
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
      results.Add(new object[] { title, r.Left, r.Top, r.Right - r.Left, r.Bottom - r.Top, (int)pid, hWnd.ToInt64() });
      return true;
    }, IntPtr.Zero);
    return results;
  }
  public static long ForegroundHwnd() { return GetForegroundWindow().ToInt64(); }
}
"@
$fg = [Win32]::ForegroundHwnd()
$windows = [Win32]::GetWindows()
Write-Output "FG:$fg"
$windows | ForEach-Object { "$($_[0])|$($_[1])|$($_[2])|$($_[3])|$($_[4])|$($_[5])|$($_[6])" }
`;

function matchesRs3(title: string): boolean {
  if (EXCLUDE_PATTERNS.some((p) => p.test(title))) return false;
  return RS3_TITLE_PATTERNS.some((p) => p.test(title));
}

interface WindowScanResult {
  foregroundHwnd: number | null;
  game: GameWindowInfo;
}

async function scanWindows(): Promise<WindowScanResult> {
  if (process.platform !== 'win32') {
    return {
      foregroundHwnd: null,
      game: { found: false, title: '', bounds: null, processId: null, hwnd: null },
    };
  }

  try {
    const { stdout } = await execFileAsync(
      'powershell',
      ['-NoProfile', '-NonInteractive', '-Command', POWERSHELL_SCRIPT],
      { timeout: 10000, maxBuffer: 10 * 1024 * 1024 },
    );

    let foregroundHwnd: number | null = null;
    const candidates: GameWindowInfo[] = [];

    for (const line of stdout.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('FG:')) {
        const fg = parseInt(trimmed.slice(3), 10);
        foregroundHwnd = Number.isFinite(fg) && fg > 0 ? fg : null;
        continue;
      }

      const parts = trimmed.split('|');
      if (parts.length < 7) continue;

      const title = parts[0];
      if (!matchesRs3(title)) continue;

      const x = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      const width = parseInt(parts[3], 10);
      const height = parseInt(parts[4], 10);
      const processId = parseInt(parts[5], 10);
      const hwnd = parseInt(parts[6], 10);

      if (width < 640 || height < 480) continue;

      candidates.push({
        found: true,
        title,
        bounds: { x, y, width, height },
        processId,
        hwnd: Number.isFinite(hwnd) ? hwnd : null,
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

    return {
      foregroundHwnd,
      game: candidates[0] ?? { found: false, title: '', bounds: null, processId: null, hwnd: null },
    };
  } catch {
    return {
      foregroundHwnd: null,
      game: { found: false, title: '', bounds: null, processId: null, hwnd: null },
    };
  }
}

export async function findGameWindow(): Promise<GameWindowInfo> {
  const { game } = await scanWindows();
  return game;
}

const OVERLAY_WIDTH = 480;
const OVERLAY_HEIGHT = 560;
const ATTACH_POLL_MS = 400;

function computeOverlayBounds(game: WindowBounds): WindowBounds {
  const display = screen.getDisplayMatching({
    x: game.x + Math.floor(game.width / 2),
    y: game.y + Math.floor(game.height / 2),
    width: 1,
    height: 1,
  });

  const work = display.workArea;
  const x = Math.max(work.x, Math.min(game.x + 8, work.x + work.width - OVERLAY_WIDTH));
  const y = Math.max(work.y, Math.min(game.y + 8, work.y + work.height - OVERLAY_HEIGHT));

  return { x, y, width: OVERLAY_WIDTH, height: OVERLAY_HEIGHT };
}

export class GameWindowTracker {
  private attached = false;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private lastGameInfo: GameWindowInfo | null = null;
  private savedBounds: WindowBounds | null = null;
  private gameHwnd: number | null = null;
  private hiddenForFocus = false;

  constructor(private overlayWindow: BrowserWindow) {}

  isAttached(): boolean {
    return this.attached;
  }

  getLastGameInfo(): GameWindowInfo | null {
    return this.lastGameInfo;
  }

  attach(): void {
    if (this.attached) return;

    const current = this.overlayWindow.getBounds();
    this.savedBounds = {
      x: current.x,
      y: current.y,
      width: current.width,
      height: current.height,
    };

    this.attached = true;
    this.hiddenForFocus = false;
    void this.poll();
    this.pollTimer = setInterval(() => void this.poll(), ATTACH_POLL_MS);
  }

  detach(): void {
    this.attached = false;
    this.gameHwnd = null;
    this.hiddenForFocus = false;
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

  private getOverlayHwnd(): number | null {
    if (this.overlayWindow.isDestroyed()) return null;
    const handle = this.overlayWindow.getNativeWindowHandle();
    if (!handle || handle.length < 4) return null;
    return handle.readInt32LE(0);
  }

  private async poll(): Promise<void> {
    if (!this.attached || this.overlayWindow.isDestroyed()) return;

    const { foregroundHwnd, game } = await scanWindows();
    this.lastGameInfo = game;

    if (!game.found || !game.bounds || !game.hwnd) return;

    this.gameHwnd = game.hwnd;
    const overlayHwnd = this.getOverlayHwnd();
    const rs3Focused = foregroundHwnd === game.hwnd;
    const overlayFocused = overlayHwnd != null && foregroundHwnd === overlayHwnd;
    const shouldShow = rs3Focused || overlayFocused;

    if (!shouldShow) {
      if (!this.hiddenForFocus && this.overlayWindow.isVisible()) {
        this.overlayWindow.hide();
        this.hiddenForFocus = true;
      }
      return;
    }

    if (this.hiddenForFocus) {
      this.hiddenForFocus = false;
    }

    const bounds = computeOverlayBounds(game.bounds);
    this.overlayWindow.setBounds(bounds);
    this.overlayWindow.setAlwaysOnTop(true, 'screen-saver');

    if (!this.overlayWindow.isVisible()) {
      this.overlayWindow.show();
    }

    syncHighlightToGame(game.bounds);
  }
}
