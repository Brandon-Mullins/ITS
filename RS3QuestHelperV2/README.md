# RS3 Quest Helper V2 — ONLY use this folder

**Path:** `C:\Users\bmull\RS3QuestHelperV2`  
**Version:** `0.6.4-HIGHLIGHT-FIX`  
**Port:** `5174` (NOT 5173)

Do **NOT** use `C:\Users\bmull\ITS` — that is the old project.

## One-command install (PowerShell)

```powershell
# Run as one block — kills old processes, fresh install, launches V2
Get-Process electron,node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
if (Test-Path "C:\Users\bmull\RS3QuestHelperV2") { Remove-Item "C:\Users\bmull\RS3QuestHelperV2" -Recurse -Force }
cd C:\Users\bmull
git clone --branch cursor/rs3questhelper-v2-1b6e --single-branch https://github.com/Brandon-Mullins/ITS.git RS3QuestHelperV2-tmp
Move-Item "RS3QuestHelperV2-tmp\RS3QuestHelperV2" "RS3QuestHelperV2"
Remove-Item "RS3QuestHelperV2-tmp" -Recurse -Force
cd RS3QuestHelperV2
npm install
npm run electron:fix
.\START.ps1
```

## Verify you have the right version

You MUST see all of these:

1. Green banner: `✓ RS3 Quest Helper V2 — 0.6.4-HIGHLIGHT-FIX`
2. Title bar badge: `0.6.4-HIGHLIGHT-FIX`
3. Footer: `0.6.4-HIGHLIGHT-FIX`
4. Browser console (F12): `RUNNING RS3 QUEST HELPER V2 0.6.4-HIGHLIGHT-FIX`

If you see `v0.6.3`, you are in the **wrong folder**.

## Highlights (v0.6.4-HIGHLIGHT-FIX)

- **NO** blue inventory rectangles
- **NO** world/minimap rectangles  
- **ONLY** small top text callouts on RS3 (e.g. "Talk-to: Fairy Godfather")
- Click-target cards stay in the **helper panel**

## Daily launch

```powershell
cd C:\Users\bmull\RS3QuestHelperV2
.\START.ps1
```
