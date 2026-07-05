# RS3 Quest Helper — use RS3QuestHelperV2 ONLY

**Do not run the root `ITS` folder.** That is the legacy project.

## Install (Windows)

```powershell
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

**Expected version:** `v0.6.4-HIGHLIGHT-FIX` (green banner + title bar + footer)

See [RS3QuestHelperV2/README.md](RS3QuestHelperV2/README.md) for details.
