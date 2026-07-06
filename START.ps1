# RS3 Quest Helper V2 — smart launcher (repo root OR app folder)
$ErrorActionPreference = "Stop"
$here = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }

function Find-AppDir([string]$start) {
    if (Test-Path (Join-Path $start "package.json")) {
        $pkg = Get-Content (Join-Path $start "package.json") -Raw | ConvertFrom-Json
        if ($pkg.name -eq "rs3-quest-helper-v2") { return $start }
    }
    $nested = Join-Path $start "RS3QuestHelperV2"
    if (Test-Path (Join-Path $nested "package.json")) {
        $pkg = Get-Content (Join-Path $nested "package.json") -Raw | ConvertFrom-Json
        if ($pkg.name -eq "rs3-quest-helper-v2") { return $nested }
    }
    return $null
}

$appDir = Find-AppDir $here
if (-not $appDir) {
    Write-Host ""
    Write-Host "ERROR: RS3 Quest Helper V2 not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "You are in: $here" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If you just cloned the repo, the app may be in a subfolder:" -ForegroundColor Cyan
    Write-Host "  cd $here\RS3QuestHelperV2" -ForegroundColor White
    Write-Host "  .\START.bat" -ForegroundColor White
    Write-Host ""
    Write-Host "Or run a fresh install:" -ForegroundColor Cyan
    Write-Host "  .\RS3QuestHelperV2\INSTALL.bat" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to close"
    exit 1
}

$launcher = Join-Path $appDir "START.ps1"
if (-not (Test-Path $launcher)) {
    Write-Host "ERROR: START.ps1 missing in $appDir" -ForegroundColor Red
    Write-Host "Run: git pull  (or re-run INSTALL.bat)" -ForegroundColor Yellow
    Read-Host "Press Enter to close"
    exit 1
}

& $launcher
