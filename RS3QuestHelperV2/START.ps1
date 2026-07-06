# RS3 Quest Helper V2 — START
# Do NOT double-click this file — Windows opens .ps1 in Notepad.
# Use START.bat instead (double-click START.bat).
$ErrorActionPreference = "Stop"
$ProjectDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
Set-Location $ProjectDir

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  RS3 QUEST HELPER V2" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Get-Process -Name "electron","node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found in $ProjectDir" -ForegroundColor Red
    Write-Host "Run INSTALL.ps1 first, or use START.bat from the RS3QuestHelperV2 folder." -ForegroundColor Yellow
    Read-Host "Press Enter to close"
    exit 1
}

$pkg = Get-Content package.json -Raw | ConvertFrom-Json
if ($pkg.name -ne "rs3-quest-helper-v2") {
    Write-Host "ERROR: Wrong project! name=$($pkg.name) — use RS3QuestHelperV2 only." -ForegroundColor Red
    Read-Host "Press Enter to close"
    exit 1
}

$version = $pkg.version
Write-Host "OK: $($pkg.name) $version" -ForegroundColor Cyan
Write-Host "Folder: $ProjectDir" -ForegroundColor Cyan
Write-Host "Port: 5174" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tip: Double-click START.bat (not START.ps1) to launch next time." -ForegroundColor DarkGray
Write-Host ""

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}
if (-not (Test-Path "node_modules\electron\dist\electron.exe")) {
    Write-Host "Fixing Electron..." -ForegroundColor Yellow
    npm run electron:fix
}

npm run clean
Write-Host "Look for version banner: v$version" -ForegroundColor Green
Write-Host ""
npm run electron:dev
