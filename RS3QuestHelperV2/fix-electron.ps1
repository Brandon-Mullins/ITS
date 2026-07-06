# Fix Electron after npm install wipes the binary (Windows)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$electronPkg = Get-Content -LiteralPath 'node_modules\electron\package.json' | ConvertFrom-Json
$version = $electronPkg.version
$distPath = Join-Path $PSScriptRoot 'node_modules\electron\dist'
$zipPath = Join-Path $env:TEMP "electron-v$version-win32-x64.zip"
$zipName = "electron-v$version-win32-x64.zip"

Write-Host "Fixing Electron v$version..." -ForegroundColor Yellow

if (Test-Path -LiteralPath $distPath) { Remove-Item -LiteralPath $distPath -Recurse -Force }
New-Item -ItemType Directory -Force -Path $distPath | Out-Null

$urls = @(
    "https://github.com/electron/electron/releases/download/v$version/$zipName",
    'https://npmmirror.com/mirrors/electron/v' + $version + '/' + $zipName
)

$ok = $false
foreach ($url in $urls) {
    Write-Host "Downloading from $url ..."
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing
        $ok = $true
        break
    } catch {
        Write-Host 'Failed, trying next mirror...' -ForegroundColor Red
    }
}

if (-not $ok) { throw 'Could not download Electron' }

Expand-Archive -Path $zipPath -DestinationPath $distPath -Force
Remove-Item -LiteralPath $zipPath -Force -ErrorAction SilentlyContinue
[System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'node_modules\electron\path.txt'), 'electron.exe')

if (-not (Test-Path -LiteralPath (Join-Path $distPath 'electron.exe'))) {
    throw 'electron.exe not found after extract'
}

Write-Host '[OK] Electron fixed. Run: npm run electron:dev' -ForegroundColor Green
