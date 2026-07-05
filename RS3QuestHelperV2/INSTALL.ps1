# RS3 Quest Helper V2 — Full fresh install to C:\Users\bmull\RS3QuestHelperV2
$ErrorActionPreference = "Stop"
$Target = "C:\Users\bmull\RS3QuestHelperV2"
$Branch = "cursor/rs3questhelper-v2-1b6e"
$Repo = "https://github.com/Brandon-Mullins/ITS.git"
$ExpectedVersion = "0.6.5-LAYOUT-FIX"

Write-Host "Installing RS3 Quest Helper V2 ($ExpectedVersion) to $Target" -ForegroundColor Green

Get-Process electron,node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

$Tmp = "C:\Users\bmull\RS3QuestHelperV2-tmp"
if (Test-Path $Target) { Remove-Item $Target -Recurse -Force }
if (Test-Path $Tmp) { Remove-Item $Tmp -Recurse -Force }

git clone --branch $Branch --single-branch $Repo $Tmp
if (-not (Test-Path "$Tmp\RS3QuestHelperV2")) {
    Write-Host "ERROR: RS3QuestHelperV2 folder missing in repo" -ForegroundColor Red
    exit 1
}

Move-Item "$Tmp\RS3QuestHelperV2" $Target
Remove-Item $Tmp -Recurse -Force

Set-Location $Target
npm install
npm run electron:fix

$ver = (Get-Content package.json -Raw | ConvertFrom-Json).version
if ($ver -ne $ExpectedVersion) {
    Write-Host "ERROR: Installed version $ver not $ExpectedVersion" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "SUCCESS: $Target ready at $ver" -ForegroundColor Green
Write-Host "Run: cd $Target; .\START.ps1" -ForegroundColor Cyan
