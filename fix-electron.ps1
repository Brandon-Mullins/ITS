# Manually download Electron binary when npm install.js fails (common on Windows)
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  RS3 Quest Helper - Electron Fix" -ForegroundColor Yellow
Write-Host ""

Set-Location $PSScriptRoot

# Read installed electron version
$electronPkg = Get-Content "node_modules\electron\package.json" | ConvertFrom-Json
$version = $electronPkg.version
Write-Host "Electron version: $version" -ForegroundColor Cyan

$distPath = Join-Path $PSScriptRoot "node_modules\electron\dist"
$zipPath = Join-Path $env:TEMP "electron-v$version-win32-x64.zip"
$zipName = "electron-v$version-win32-x64.zip"

$urls = @(
    "https://github.com/electron/electron/releases/download/v$version/$zipName",
    "https://npmmirror.com/mirrors/electron/v$version/$zipName"
)

# Ensure npm package exists (without deleting the whole folder)
if (-not (Test-Path "node_modules\electron\package.json")) {
    Write-Host "Installing electron npm package..." -ForegroundColor Cyan
    npm install electron --force
}

if (Test-Path $distPath) {
    Remove-Item $distPath -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $distPath | Out-Null

$downloaded = $false
foreach ($url in $urls) {
    Write-Host "Downloading from $url ..." -ForegroundColor Cyan
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing
        $downloaded = $true
        Write-Host "Download complete." -ForegroundColor Green
        break
    } catch {
        Write-Host "Failed: $_" -ForegroundColor Red
    }
}

if (-not $downloaded) {
    Write-Host ""
    Write-Host "[ERROR] Could not download Electron." -ForegroundColor Red
    Write-Host "Try: temporarily disable antivirus, or use a different network."
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Extracting to $distPath ..." -ForegroundColor Cyan
Expand-Archive -Path $zipPath -DestinationPath $distPath -Force
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue

# Electron requires path.txt pointing at the executable (created by install.js normally)
$pathTxt = Join-Path $PSScriptRoot "node_modules\electron\path.txt"
[System.IO.File]::WriteAllText($pathTxt, "electron.exe")

# Ensure dist/version exists (install.js checks this too)
$versionFile = Join-Path $distPath "version"
if (-not (Test-Path $versionFile)) {
    [System.IO.File]::WriteAllText($versionFile, "v$version")
}

$exePath = Join-Path $distPath "electron.exe"
if (Test-Path $exePath) {
    Write-Host ""
    Write-Host "[OK] Electron installed at $exePath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now run:  npm run electron:dev" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "[ERROR] electron.exe not found after extract." -ForegroundColor Red
    Get-ChildItem $distPath
    Read-Host "Press Enter to exit"
    exit 1
}
