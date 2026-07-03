# Force-update RS3 Quest Helper to latest version
$ErrorActionPreference = "Stop"

$ProjectDir = "C:\Users\bmull\ITS"
$Branch = "cursor/rs3-quest-helper-mvp1-1b6e"
$ZipUrl = "https://github.com/Brandon-Mullins/ITS/archive/refs/heads/$Branch.zip"
$TempZip = "$env:TEMP\ITS-update.zip"
$TempExtract = "$env:TEMP\ITS-update-extract"
$ElectronDist = "$ProjectDir\node_modules\electron\dist"
$ElectronPathTxt = "$ProjectDir\node_modules\electron\path.txt"
$SavedElectron = "$env:TEMP\electron-dist-backup"

Write-Host ""
Write-Host "  RS3 Quest Helper - Force Update" -ForegroundColor Yellow
Write-Host ""

# Backup electron binary so we don't have to re-download it
if (Test-Path $ElectronDist) {
    Write-Host "Backing up Electron binary..." -ForegroundColor Cyan
    if (Test-Path $SavedElectron) { Remove-Item $SavedElectron -Recurse -Force }
    Copy-Item $ElectronDist $SavedElectron -Recurse -Force
    if (Test-Path $ElectronPathTxt) {
        Copy-Item $ElectronPathTxt "$env:TEMP\electron-path-backup.txt" -Force
    }
}

Write-Host "Downloading latest code..." -ForegroundColor Cyan
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $ZipUrl -OutFile $TempZip -UseBasicParsing

Write-Host "Extracting..." -ForegroundColor Cyan
if (Test-Path $TempExtract) { Remove-Item $TempExtract -Recurse -Force }
Expand-Archive -Path $TempZip -DestinationPath $TempExtract -Force

$SourceDir = Get-ChildItem $TempExtract | Select-Object -First 1
if (Test-Path $ProjectDir) { Remove-Item $ProjectDir -Recurse -Force }
Move-Item $SourceDir.FullName $ProjectDir

# Restore electron
if (Test-Path $SavedElectron) {
    Write-Host "Restoring Electron binary..." -ForegroundColor Cyan
    $DestDist = "$ProjectDir\node_modules\electron\dist"
    New-Item -ItemType Directory -Force -Path (Split-Path $DestDist) | Out-Null
    if (-not (Test-Path "$ProjectDir\node_modules\electron")) {
        Set-Location $ProjectDir
        npm install electron --force 2>$null
    }
    if (Test-Path $DestDist) { Remove-Item $DestDist -Recurse -Force }
    Copy-Item $SavedElectron $DestDist -Recurse -Force
    if (Test-Path "$env:TEMP\electron-path-backup.txt") {
        Copy-Item "$env:TEMP\electron-path-backup.txt" "$ProjectDir\node_modules\electron\path.txt" -Force
    } else {
        [System.IO.File]::WriteAllText("$ProjectDir\node_modules\electron\path.txt", "electron.exe")
    }
}

Set-Location $ProjectDir
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

# Cleanup
Remove-Item $TempZip -Force -ErrorAction SilentlyContinue
Remove-Item $TempExtract -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "[OK] Updated to latest version!" -ForegroundColor Green
Write-Host ""
Write-Host "You should now see:" -ForegroundColor Yellow
Write-Host "  - RuneScape name input box at the top"
Write-Host "  - Quest status colors when you load your RSN"
Write-Host "  - No more Skills.split errors"
Write-Host ""
Write-Host "Starting app..." -ForegroundColor Cyan
npm run electron:dev
