# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **single Electron + React + TypeScript + Vite desktop app** (`rs3-quest-helper-overlay`) — a read-only RuneScape 3 quest-guide overlay. There is no backend, database, or separate services. Package manager is **npm** (`package-lock.json`). Node 20+ (README); the VM ships Node 22, which works.

Standard commands live in `package.json` scripts and `README.md`; don't duplicate them here. Key ones: `npm run dev` / `npm run electron:dev` (identical — both run Vite), `npm run build`, `npm run typecheck`, `npm run seed`.

Non-obvious caveats for future agents:

- **`postinstall` prints `⚠ Electron binary missing. Run: npm run electron:fix` on Linux/macOS — ignore it.** The check only looks for the Windows `electron.exe`; the Linux Electron binary (`node_modules/electron/dist/electron`) is present and works. `npm run electron:fix` is PowerShell/Windows-only and must NOT be run here.
- **`npm run dev` does two things:** starts the Vite dev server at `http://localhost:5173` AND launches the Electron overlay window via `vite-plugin-electron` (see `vite.config.ts`). A display is available (`DISPLAY=:1`).
- **Expected non-fatal Electron noise in the VM:** `Failed to connect to the bus`, `Exiting GPU process due to errors`, and a `sharp`/Electron-Linux compatibility warning. The transparent, frameless overlay still renders correctly via software rendering.
- **Windows-only features are inert on Linux:** game-window attach and OCR "smart detect" (`screenshot-desktop`, PowerShell in `electron/game-window.ts`) return "not found" / no-op. The quest search + guide UI works fully regardless.
- **Data:** 391-quest index is bundled at `data/quest-index.json` (read offline in Electron). Curated quest guides are compiled into the bundle and work offline; non-curated guides and the browser-mode index fetch from the public RuneScape Wiki API (needs network). Electron persistence lives under `app.getPath('userData')/quest-data`; browser mode falls back to `localStorage`.
- **No lint or test tooling exists** (no ESLint/Prettier, no test framework, no CI). The only static validation is `npm run typecheck`; correctness of quest data is checked in-app via the Editor tab / `src/services/quest-validator.ts`.
