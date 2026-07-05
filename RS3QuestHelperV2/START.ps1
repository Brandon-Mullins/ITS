# RS3 Quest Helper V2 — START (0.6.4-HIGHLIGHT-FIX)
$ErrorActionPreference = "Stop"
$ProjectDir = if ($PSScriptRoot) { $PSScriptRoot } else { "C:\Users\bmull\RS3QuestHelperV2" }
$ExpectedVersion = "0.6.4-HIGHLIGHT-FIX"

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  RS3 QUEST HELPER V2 - $ExpectedVersion" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Get-Process -Name "electron","node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Set-Location $ProjectDir

if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found. Folder must be C:\Users\bmull\RS3QuestHelperV2" -ForegroundColor Red
    exit 1
}

$pkg = Get-Content package.json -Raw | ConvertFrom-Json
if ($pkg.name -ne "rs3-quest-helper-v2") {
    Write-Host "ERROR: Wrong project! name=$($pkg.name) — use RS3QuestHelperV2 only." -ForegroundColor Red
    exit 1
}
if ($pkg.version -ne $ExpectedVersion) {
    Write-Host "ERROR: Wrong version $($pkg.version) — expected $ExpectedVersion" -ForegroundColor Red
    Write-Host "Re-run INSTALL.ps1 or the install block from README.md" -ForegroundColor Yellow
    exit 1
}

Write-Host "OK: $($pkg.name) $($pkg.version)" -ForegroundColor Cyan
Write-Host "Port: 5174" -ForegroundColor Cyan
Write-Host "NO in-game rectangles in this build" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "node_modules")) { npm install }
if (-not (Test-Path "node_modules\electron\dist\electron.exe")) { npm run electron:fix }

npm run clean
Write-Host "Look for green banner: v0.6.4-HIGHLIGHT-FIX" -ForegroundColor Green
Write-Host ""
npm run electron:dev
