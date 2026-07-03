# Force-update RS3 Quest Helper to latest version (v0.5.1+)
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
Write-Host "  RS3 Quest Helper - Force Update (v0.5.1)" -ForegroundColor Yellow
Write-Host ""

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

# In-place copy (keeps node_modules)
Write-Host "Copying files into $ProjectDir ..." -ForegroundColor Cyan
Copy-Item "$($SourceDir.FullName)\*" $ProjectDir -Recurse -Force

if (Test-Path $SavedElectron) {
    Write-Host "Restoring Electron binary..." -ForegroundColor Cyan
    $DestDist = "$ProjectDir\node_modules\electron\dist"
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

Remove-Item $TempZip -Force -ErrorAction SilentlyContinue
Remove-Item $TempExtract -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "[OK] Updated to v0.5.1!" -ForegroundColor Green
Write-Host ""
Write-Host "You should now see:" -ForegroundColor Yellow
Write-Host "  - v0.5.1 badge in the title bar"
Write-Host "  - LEFT SIDEBAR with Quests / Goals / Editor / Why RS3 tabs"
Write-Host "  - What's New banner + tutorial on first launch"
Write-Host "  - Goals tab with Fairy Rings, Prifddinas, etc."
Write-Host "  - Smart routes (Fastest / Ironman / No teleport) on quest steps"
Write-Host ""
Write-Host "IMPORTANT: Click the LINK icon to DETACH from RS3 to see full UI." -ForegroundColor Cyan
Write-Host "  Attached mode = compact step overlay only"
Write-Host "  Detached mode = full planner with sidebar"
Write-Host ""
Write-Host "Starting app..." -ForegroundColor Cyan
npm run electron:dev
