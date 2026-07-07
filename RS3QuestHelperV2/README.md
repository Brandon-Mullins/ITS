# RS3 Quest Helper V2 — ONLY use this folder

**Correct path:** `C:\Users\bmull\RS3QuestHelperV2`  
**NOT:** `C:\Users\bmull\RS3QuestHelperV2\RS3QuestHelperV2` (nested — works but wrong)

## Launch (daily)

```powershell
cd C:\Users\bmull\RS3QuestHelperV2
.\START.bat
```

If you accidentally installed nested, either use:

```powershell
cd C:\Users\bmull\RS3QuestHelperV2\RS3QuestHelperV2
.\START.bat
```

Or run **UPDATE.bat** from `C:\Users\bmull` to flatten (see below).

## Fresh install / update (run from C:\Users\bmull)

**Important:** run these from `C:\Users\bmull`, NOT from inside RS3QuestHelperV2.

```powershell
cd C:\Users\bmull
.\RS3QuestHelperV2\UPDATE.bat
```

Or manually:

```powershell
cd C:\Users\bmull
Get-Process electron,node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item RS3QuestHelperV2 -Recurse -Force -ErrorAction SilentlyContinue
git clone --branch cursor/rasial-roadmap-1b6e --single-branch https://github.com/Brandon-Mullins/ITS.git RS3QuestHelperV2-tmp
Move-Item RS3QuestHelperV2-tmp\RS3QuestHelperV2 RS3QuestHelperV2
Remove-Item RS3QuestHelperV2-tmp -Recurse -Force
cd RS3QuestHelperV2
npm install
npm run electron:fix
.\START.bat
```

## Verify version

Footer should match `package.json` version (currently **v0.7.2-INV-FIX**).

```powershell
cd C:\Users\bmull\RS3QuestHelperV2
node -p "require('./package.json').version"
```
