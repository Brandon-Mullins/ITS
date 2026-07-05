# RS3 Quest Helper - One-click Windows installer
# Run in PowerShell: right-click Start -> Terminal (or PowerShell), then paste the block from README

$ErrorActionPreference = "Stop"
$ProjectDir = Join-Path $env:USERPROFILE "ITS"
$Branch = "cursor/rs3-quest-helper-mvp1-1b6e"
$ZipUrl = "https://github.com/Brandon-Mullins/ITS/archive/refs/heads/$Branch.zip"
$ZipPath = Join-Path $env:TEMP "ITS.zip"
$ExtractDir = Join-Path $env:TEMP "ITS-extract"

Write-Host ""
Write-Host "  RS3 Quest Helper - Setup" -ForegroundColor Yellow
Write-Host ""

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed." -ForegroundColor Red
    Write-Host "Install it from https://nodejs.org/ (LTS), then run this script again."
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Node.js: $(node --version)" -ForegroundColor Green

# Download project if needed
if (-not (Test-Path (Join-Path $ProjectDir "package.json"))) {
    Write-Host "[1/3] Downloading project..." -ForegroundColor Cyan
    if (Test-Path $ProjectDir) { Remove-Item $ProjectDir -Recurse -Force }
    if (Test-Path $ExtractDir) { Remove-Item $ExtractDir -Recurse -Force }

    Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath -UseBasicParsing
    Expand-Archive -Path $ZipPath -DestinationPath $ExtractDir -Force

    $folder = Get-ChildItem $ExtractDir | Select-Object -First 1
    Move-Item $folder.FullName $ProjectDir
    Remove-Item $ZipPath -Force -ErrorAction SilentlyContinue
    Remove-Item $ExtractDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Project installed to $ProjectDir" -ForegroundColor Green
} else {
    Write-Host "[1/3] Project already at $ProjectDir" -ForegroundColor Green
}

Set-Location $ProjectDir

Write-Host "[2/3] Installing dependencies (may take 1-2 min)..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
Write-Host "[OK] Dependencies installed" -ForegroundColor Green

Write-Host "[3/3] Launching overlay..." -ForegroundColor Cyan
Write-Host ""
Write-Host "  The app window should open in a few seconds." -ForegroundColor Yellow
Write-Host "  Keep this window open while using the app." -ForegroundColor Yellow
Write-Host ""

npm run electron:dev
