# DEPRECATED — do not install from the repo root (legacy ITS project).
$ErrorActionPreference = "Stop"
Write-Host ""
Write-Host "================================================" -ForegroundColor Red
Write-Host "  WRONG FOLDER — do NOT use C:\Users\bmull\ITS" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Red
Write-Host ""
Write-Host "Use ONLY: C:\Users\bmull\RS3QuestHelperV2" -ForegroundColor Yellow
Write-Host "Expected version: v0.6.4-HIGHLIGHT-FIX" -ForegroundColor Green
Write-Host ""
Write-Host "Run the install block in README.md or:" -ForegroundColor Cyan
Write-Host "  .\RS3QuestHelperV2\INSTALL.bat" -ForegroundColor Cyan
Write-Host "  Or if already cloned: .\START.bat" -ForegroundColor Cyan
Write-Host ""
if (Test-Path (Join-Path $PSScriptRoot "RS3QuestHelperV2\INSTALL.ps1")) {
    $answer = Read-Host "Run RS3QuestHelperV2\INSTALL.ps1 now? (y/n)"
    if ($answer -eq 'y') { & (Join-Path $PSScriptRoot "RS3QuestHelperV2\INSTALL.ps1") }
}
exit 1
