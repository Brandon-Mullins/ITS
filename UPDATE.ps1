# RS3 Quest Helper — in-place update (never deletes project folder)
$ErrorActionPreference = "Stop"

$ProjectDir = if ($PSScriptRoot) { $PSScriptRoot } else { "C:\Users\bmull\ITS" }
$Branch = "cursor/rs3-quest-helper-mvp1-1b6e"
$ZipUrl = "https://github.com/Brandon-Mullins/ITS/archive/refs/heads/$Branch.zip"
$TempZip = "$env:TEMP\ITS-update.zip"
$TempExtract = "$env:TEMP\ITS-update-extract"
$ElectronDist = Join-Path $ProjectDir "node_modules\electron\dist"
$ElectronPathTxt = Join-Path $ProjectDir "node_modules\electron\path.txt"
$SavedElectron = "$env:TEMP\electron-dist-backup"

Write-Host ""
Write-Host "  RS3 Quest Helper - In-Place Update" -ForegroundColor Yellow
Write-Host "  Project: $ProjectDir" -ForegroundColor Gray
Write-Host ""

# Warn if app might be running
$running = Get-Process -Name "electron" -ErrorAction SilentlyContinue
if ($running) {
    Write-Host "Close the Quest Helper / Electron window first, then run this again." -ForegroundColor Red
    Write-Host "Or press Enter to continue anyway (copy may still work)..." -ForegroundColor Yellow
    Read-Host
}

# Backup electron binary (npm install won't re-download if present)
if (Test-Path $ElectronDist) {
    Write-Host "Backing up Electron binary..." -ForegroundColor Cyan
    if (Test-Path $SavedElectron) { Remove-Item $SavedElectron -Recurse -Force }
    Copy-Item $ElectronDist $SavedElectron -Recurse -Force
    if (Test-Path $ElectronPathTxt) {
        Copy-Item $ElectronPathTxt "$env:TEMP\electron-path-backup.txt" -Force
    }
}

Write-Host "Downloading latest code from GitHub..." -ForegroundColor Cyan
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $ZipUrl -OutFile $TempZip -UseBasicParsing

Write-Host "Extracting..." -ForegroundColor Cyan
if (Test-Path $TempExtract) { Remove-Item $TempExtract -Recurse -Force }
Expand-Archive -Path $TempZip -DestinationPath $TempExtract -Force

$SourceDir = (Get-ChildItem $TempExtract | Select-Object -First 1).FullName
if (-not $SourceDir) { throw "Could not find extracted source folder" }

# In-place copy — NEVER delete $ProjectDir
Write-Host "Copying into $ProjectDir (keeping node_modules)..." -ForegroundColor Cyan
$excludeDirs = @('node_modules', '.git')
Get-ChildItem $SourceDir -Force | ForEach-Object {
    if ($excludeDirs -contains $_.Name) { return }
    $dest = Join-Path $ProjectDir $_.Name
    if ($_.PSIsContainer) {
        Copy-Item $_.FullName $dest -Recurse -Force
    } else {
        Copy-Item $_.FullName $dest -Force
    }
}

# Restore electron if backup exists
if (Test-Path $SavedElectron) {
    Write-Host "Restoring Electron binary..." -ForegroundColor Cyan
    $DestDist = Join-Path $ProjectDir "node_modules\electron\dist"
    $ElectronPkg = Join-Path $ProjectDir "node_modules\electron"
    if (-not (Test-Path $ElectronPkg)) {
        Set-Location $ProjectDir
        npm install electron --force 2>$null
    }
    New-Item -ItemType Directory -Force -Path (Split-Path $DestDist) | Out-Null
    if (Test-Path $DestDist) { Remove-Item $DestDist -Recurse -Force }
    Copy-Item $SavedElectron $DestDist -Recurse -Force
    if (Test-Path "$env:TEMP\electron-path-backup.txt") {
        Copy-Item "$env:TEMP\electron-path-backup.txt" (Join-Path $ProjectDir "node_modules\electron\path.txt") -Force
    } else {
        [System.IO.File]::WriteAllText((Join-Path $ProjectDir "node_modules\electron\path.txt"), "electron.exe")
    }
}

Set-Location $ProjectDir
Write-Host "npm install..." -ForegroundColor Cyan
npm install

Remove-Item $TempZip -Force -ErrorAction SilentlyContinue
Remove-Item $TempExtract -Recurse -Force -ErrorAction SilentlyContinue

$version = (Get-Content package.json -Raw | ConvertFrom-Json).version
Write-Host ""
Write-Host "[OK] Updated to v$version" -ForegroundColor Green
Write-Host ""
Write-Host "Look for:" -ForegroundColor Yellow
Write-Host "  - v$version in the title bar"
Write-Host "  - LEFT sidebar: Quests | Goals | Editor | Why RS3"
Write-Host "  - Click DETACH (link icon) if locked to RS3 — attached = compact only"
Write-Host ""
Write-Host "Starting app..." -ForegroundColor Cyan
npm run electron:dev
