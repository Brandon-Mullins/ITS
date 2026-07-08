# RS3 Quest Helper — use RS3QuestHelperV2 ONLY

**Do not run the legacy root project.** Your folder must contain `package.json` with `"name": "rs3-quest-helper-v2"`.

## If launch fails or you see "WRONG FOLDER"

Your install is probably the old ITS repo root. Fix it:

```powershell
cd C:\Users\bmull\RS3QuestHelperV2
git fetch
git checkout cursor/rasial-roadmap-1b6e
git pull
.\RS3QuestHelperV2\FIX-INSTALL.bat
```

That wipes and reinstalls a **clean** V2-only folder, then launches.

## Quick launch (correct install)

Double-click **`START.bat`** in `C:\Users\bmull\RS3QuestHelperV2`

Or:

```powershell
cd C:\Users\bmull\RS3QuestHelperV2
.\START.bat
```

## Verify correct folder

```powershell
cd C:\Users\bmull\RS3QuestHelperV2
(Get-Content package.json | ConvertFrom-Json).name
```

Must print: `rs3-quest-helper-v2`

If it prints `rs3-quest-helper-overlay`, you are in the **wrong** (legacy) layout — run FIX-INSTALL.bat above.

**Expected version:** `v0.7.0-RASIAL-ROADMAP`

See [RS3QuestHelperV2/README.md](RS3QuestHelperV2/README.md) for details.
