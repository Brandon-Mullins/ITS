# Fix Electron binary download on Windows
$ErrorActionPreference = "Stop"

Write-Host "Fixing Electron installation..." -ForegroundColor Yellow

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

if (Test-Path "node_modules\electron") {
    Remove-Item "node_modules\electron" -Recurse -Force
    Write-Host "Removed broken electron folder." -ForegroundColor Cyan
}

Write-Host "Re-downloading Electron (this may take a minute)..." -ForegroundColor Cyan
npm install electron --force

Write-Host "Running Electron install script..." -ForegroundColor Cyan
node node_modules/electron/install.js

if (-not (Test-Path "node_modules\electron\dist\electron.exe")) {
    Write-Host ""
    Write-Host "Electron still missing. Trying mirror..." -ForegroundColor Yellow
    $env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
    Remove-Item "node_modules\electron" -Recurse -Force -ErrorAction SilentlyContinue
    npm install electron --force
    node node_modules/electron/install.js
}

if (Test-Path "node_modules\electron\dist\electron.exe") {
    Write-Host ""
    Write-Host "[OK] Electron installed successfully!" -ForegroundColor Green
    Write-Host "Now run: npm run electron:dev" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[ERROR] Electron binary still missing." -ForegroundColor Red
    Write-Host "Try temporarily disabling antivirus, then run this script again."
    Read-Host "Press Enter to exit"
    exit 1
}
