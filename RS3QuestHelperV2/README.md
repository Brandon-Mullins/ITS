# RS3 Quest Helper V2 — ONLY use this folder

**Path:** `C:\Users\bmull\RS3QuestHelperV2`  
**Version:** `v0.7.0-RASIAL-ROADMAP`  
**Port:** `5174` (NOT 5173)

Do **NOT** use `C:\Users\bmull\ITS` — that is the old project.

## Launch (daily use)

**Double-click `START.bat`** in this folder.

`START.bat` is pure batch (no PowerShell) so it works reliably on Windows.

Or from PowerShell:

```powershell
cd C:\Users\bmull\RS3QuestHelperV2
.\START.bat
```

## One-command install (PowerShell)

```powershell
Get-Process electron,node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
if (Test-Path "C:\Users\bmull\RS3QuestHelperV2") { Remove-Item "C:\Users\bmull\RS3QuestHelperV2" -Recurse -Force }
cd C:\Users\bmull
git clone --branch cursor/rasial-roadmap-1b6e --single-branch https://github.com/Brandon-Mullins/ITS.git RS3QuestHelperV2-tmp
Move-Item "RS3QuestHelperV2-tmp\RS3QuestHelperV2" "RS3QuestHelperV2"
Remove-Item "RS3QuestHelperV2-tmp" -Recurse -Force
cd RS3QuestHelperV2
npm install
npm run electron:fix
.\START.bat
```

Or double-click **`INSTALL.bat`** after cloning the repo manually.

## Verify you have the right version

You MUST see:

1. Green banner: `✓ RS3 Quest Helper V2 — v0.7.0-RASIAL-ROADMAP`
2. Title bar / footer with the same version
3. Goals tab has **Unlock Rasial** card

If you see an older version, you are in the **wrong folder** or need to re-run install.

## Highlights

- **Road to Rasial** goal campaign (21 quests)
- GPS-style quest guide UI
- **NO** in-game blue rectangles (text callouts only)
- Use **START.bat** to launch — not START.ps1
