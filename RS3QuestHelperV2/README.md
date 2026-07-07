# RS3 Quest Helper V2 — ONLY use this folder

**Correct path:** `C:\Users\bmull\RS3QuestHelperV2`  
**NOT:** `C:\Users\bmull\RS3QuestHelperV2\RS3QuestHelperV2` (nested — do not use)

## Launch (daily)

```powershell
cd C:\Users\bmull\RS3QuestHelperV2
.\START.bat
```

## Fresh install (PowerShell 5.1 — copy/paste all of this)

**You must delete the old folder first** or Windows keeps v0.7.1 files.

```powershell
cd C:\Users\bmull
Get-Process electron,node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item RS3QuestHelperV2 -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item RS3QuestHelperV2-tmp -Recurse -Force -ErrorAction SilentlyContinue
git clone --branch cursor/inv-fix-1b6e --single-branch https://github.com/Brandon-Mullins/ITS.git RS3QuestHelperV2-tmp
Move-Item RS3QuestHelperV2-tmp\RS3QuestHelperV2 RS3QuestHelperV2
Remove-Item RS3QuestHelperV2-tmp -Recurse -Force
cd RS3QuestHelperV2
node -p "require('./package.json').version"
```

Last line **must** print `0.7.4-ATTACH-FIX`. If it says `0.7.1-INV-LIVE`, the old folder was not deleted.

Then:

```powershell
npm install
npm run electron:fix
.\START.bat
```

## Or use INSTALL-FRESH.bat (after you have any copy once)

From `C:\Users\bmull\RS3QuestHelperV2`:

```powershell
cmd /c INSTALL-FRESH.bat
```

## Verify version

Footer must show **v0.7.4-ATTACH-FIX** (not v0.7.1).

```powershell
cd C:\Users\bmull\RS3QuestHelperV2
node -p "require('./package.json').version"
```
