# RS3 Quest Helper V2 - Full fresh install
$ErrorActionPreference = 'Stop'
$Target = 'C:\Users\bmull\RS3QuestHelperV2'
$Branch = 'cursor/rasial-roadmap-1b6e'
$Repo = 'https://github.com/Brandon-Mullins/ITS.git'

Write-Host "Installing RS3 Quest Helper V2 to $Target" -ForegroundColor Green
Write-Host "Branch: $Branch" -ForegroundColor Cyan

Get-Process -Name electron,node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

$Tmp = 'C:\Users\bmull\RS3QuestHelperV2-tmp'
if (Test-Path -LiteralPath $Target) { Remove-Item -LiteralPath $Target -Recurse -Force }
if (Test-Path -LiteralPath $Tmp) { Remove-Item -LiteralPath $Tmp -Recurse -Force }

git clone --branch $Branch --single-branch $Repo $Tmp
if (-not (Test-Path -LiteralPath "$Tmp\RS3QuestHelperV2")) {
    Write-Host 'ERROR: RS3QuestHelperV2 folder missing in repo' -ForegroundColor Red
    Read-Host 'Press Enter to close'
    exit 1
}

Move-Item -LiteralPath "$Tmp\RS3QuestHelperV2" -Destination $Target
Remove-Item -LiteralPath $Tmp -Recurse -Force

Set-Location -LiteralPath $Target
npm install
npm run electron:fix

$ver = (Get-Content -LiteralPath 'package.json' -Raw | ConvertFrom-Json).version
Write-Host ''
Write-Host "SUCCESS: $Target ready at v$ver" -ForegroundColor Green
Write-Host ''
Write-Host 'To launch: double-click START.bat' -ForegroundColor Cyan
Read-Host 'Press Enter to close'
