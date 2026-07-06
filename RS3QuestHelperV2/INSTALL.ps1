# RS3 Quest Helper V2 — Full fresh install to C:\Users\bmull\RS3QuestHelperV2
$ErrorActionPreference = "Stop"
$Target = "C:\Users\bmull\RS3QuestHelperV2"
$Branch = "cursor/rasial-roadmap-1b6e"
$Repo = "https://github.com/Brandon-Mullins/ITS.git"

Write-Host "Installing RS3 Quest Helper V2 to $Target" -ForegroundColor Green
Write-Host "Branch: $Branch" -ForegroundColor Cyan

Get-Process electron,node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

$Tmp = "C:\Users\bmull\RS3QuestHelperV2-tmp"
if (Test-Path $Target) { Remove-Item $Target -Recurse -Force }
if (Test-Path $Tmp) { Remove-Item $Tmp -Recurse -Force }

git clone --branch $Branch --single-branch $Repo $Tmp
if (-not (Test-Path "$Tmp\RS3QuestHelperV2")) {
    Write-Host "ERROR: RS3QuestHelperV2 folder missing in repo" -ForegroundColor Red
    Read-Host "Press Enter to close"
    exit 1
}

Move-Item "$Tmp\RS3QuestHelperV2" $Target
Remove-Item $Tmp -Recurse -Force

Set-Location $Target
npm install
npm run electron:fix

$ver = (Get-Content package.json -Raw | ConvertFrom-Json).version
Write-Host ""
Write-Host "SUCCESS: $Target ready at v$ver" -ForegroundColor Green
Write-Host ""
Write-Host "To launch:" -ForegroundColor Cyan
Write-Host "  Double-click: $Target\START.bat" -ForegroundColor White
Write-Host "  Or PowerShell: cd $Target; .\START.ps1" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to close"
