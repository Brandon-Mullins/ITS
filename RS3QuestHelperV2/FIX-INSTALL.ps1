# One-shot fix for messy C:\Users\bmull\RS3QuestHelperV2 installs
$ErrorActionPreference = "Stop"
$Target = "C:\Users\bmull\RS3QuestHelperV2"
$Branch = "cursor/rasial-roadmap-1b6e"

Write-Host ""
Write-Host "RS3 Quest Helper V2 — FIX INSTALL" -ForegroundColor Green
Write-Host "This replaces your folder with a clean V2-only install." -ForegroundColor Yellow
Write-Host ""

$answer = Read-Host "Continue? This deletes $Target and reinstalls (y/n)"
if ($answer -ne 'y') { exit 0 }

Get-Process electron,node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

$Tmp = "C:\Users\bmull\RS3QuestHelperV2-tmp"
if (Test-Path $Target) { Remove-Item $Target -Recurse -Force }
if (Test-Path $Tmp) { Remove-Item $Tmp -Recurse -Force }

git clone --branch $Branch --single-branch "https://github.com/Brandon-Mullins/ITS.git" $Tmp
if (-not (Test-Path "$Tmp\RS3QuestHelperV2")) {
    Write-Host "ERROR: RS3QuestHelperV2 folder missing in repo" -ForegroundColor Red
    Read-Host "Press Enter"
    exit 1
}

Move-Item "$Tmp\RS3QuestHelperV2" $Target
Remove-Item $Tmp -Recurse -Force

Set-Location $Target
npm install
npm run electron:fix

$ver = (Get-Content package.json -Raw | ConvertFrom-Json).version
Write-Host ""
Write-Host "SUCCESS: v$ver installed to $Target" -ForegroundColor Green
Write-Host "Double-click: $Target\START.bat" -ForegroundColor Cyan
Write-Host ""
$launch = Read-Host "Launch now? (y/n)"
if ($launch -eq 'y') { & (Join-Path $Target "START.bat") }
