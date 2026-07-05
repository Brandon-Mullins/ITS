# RS3 Quest Helper - PowerShell launcher (use this if LAUNCH.bat fails)
$ErrorActionPreference = "Stop"
$ProjectDir = if ($PSScriptRoot) { $PSScriptRoot } else { "C:\Users\bmull\ITS" }

Write-Host ""
Write-Host "  RS3 Quest Helper - LAUNCHER" -ForegroundColor Yellow
Write-Host ""

Get-Process -Name "electron" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "RS3 Quest Helper" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Set-Location $ProjectDir
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found at $ProjectDir" -ForegroundColor Red
    exit 1
}

$version = (Get-Content package.json -Raw | ConvertFrom-Json).version
Write-Host "Installed version: v$version" -ForegroundColor Green
Write-Host ""
Write-Host "A separate Electron window will open (not your browser)." -ForegroundColor Cyan
Write-Host "Look for v$version in the title bar." -ForegroundColor Cyan
Write-Host "Click Fairy Tale II in the green Official Guides section." -ForegroundColor Cyan
Write-Host ""
Write-Host "Keep this window open while using the app." -ForegroundColor Gray
Write-Host ""

$viteCache = Join-Path $ProjectDir "node_modules\.vite"
if (Test-Path $viteCache) { Remove-Item $viteCache -Recurse -Force }

npm run electron:dev
