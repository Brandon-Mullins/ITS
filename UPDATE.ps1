# DEPRECATED — legacy ITS updater. Use RS3QuestHelperV2 only.
$ErrorActionPreference = "Stop"
Write-Host ""
Write-Host "================================================" -ForegroundColor Red
Write-Host "  WRONG UPDATER — do NOT use C:\Users\bmull\ITS" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Red
Write-Host ""
Write-Host "Delete old folders and reinstall to:" -ForegroundColor Yellow
Write-Host "  C:\Users\bmull\RS3QuestHelperV2" -ForegroundColor Yellow
Write-Host ""
Write-Host "Run:  .\RS3QuestHelperV2\INSTALL.ps1" -ForegroundColor Cyan
Write-Host "Or the install block in README.md" -ForegroundColor Cyan
Write-Host ""
$v2 = Join-Path $env:USERPROFILE "RS3QuestHelperV2\INSTALL.ps1"
if (Test-Path $v2) {
    $answer = Read-Host "Run fresh install to RS3QuestHelperV2 now? (y/n)"
    if ($answer -eq 'y') { & $v2 }
}
exit 1
