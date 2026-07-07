# One-shot fix for messy C:\Users\bmull\RS3QuestHelperV2 installs
$ErrorActionPreference = 'Stop'
$Target = 'C:\Users\bmull\RS3QuestHelperV2'
$Branch = 'cursor/rasial-roadmap-1b6e'
$Repo = 'https://github.com/Brandon-Mullins/ITS.git'

# Re-launch from TEMP so we can delete the install folder safely
$myPath = $MyInvocation.MyCommand.Path
if ($myPath -and ($myPath -notlike "$env:TEMP\*")) {
    $tempScript = Join-Path $env:TEMP 'RS3QuestHelperV2-FIX-INSTALL.ps1'
    Copy-Item -LiteralPath $myPath -Destination $tempScript -Force
    $args = "-NoProfile -ExecutionPolicy Bypass -File `"$tempScript`""
    Start-Process -FilePath 'powershell.exe' -ArgumentList $args -Wait
    exit $LASTEXITCODE
}

Write-Host ''
Write-Host 'RS3 Quest Helper V2 - FIX INSTALL' -ForegroundColor Green
Write-Host 'This replaces your folder with a clean V2-only install.' -ForegroundColor Yellow
Write-Host ''

$answer = Read-Host "Continue? This deletes $Target and reinstalls (y/n)"
if ($answer -ne 'y') { exit 0 }

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
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npm run electron:fix
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$ver = (Get-Content -LiteralPath 'package.json' -Raw | ConvertFrom-Json).version
Write-Host ''
Write-Host "SUCCESS: v$ver installed to $Target" -ForegroundColor Green
Write-Host "Double-click: $Target\START.bat" -ForegroundColor Cyan
Write-Host ''
$launch = Read-Host 'Launch now? (y/n)'
if ($launch -eq 'y') {
    $startBat = Join-Path $Target 'START.bat'
    & $startBat
}
