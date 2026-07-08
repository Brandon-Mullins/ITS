# DEPRECATED — legacy ITS launcher. Use RS3QuestHelperV2 only.
$ErrorActionPreference = "Stop"
Write-Host ""
Write-Host "================================================" -ForegroundColor Red
Write-Host "  WRONG LAUNCHER — do NOT use C:\Users\bmull\ITS" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Red
Write-Host ""
Write-Host "Use ONLY: C:\Users\bmull\RS3QuestHelperV2" -ForegroundColor Yellow
Write-Host "Run:  cd C:\Users\bmull\RS3QuestHelperV2; .\START.ps1" -ForegroundColor Cyan
Write-Host "Expected version in UI: v0.6.4-HIGHLIGHT-FIX" -ForegroundColor Green
Write-Host ""
$v2 = Join-Path $env:USERPROFILE "RS3QuestHelperV2\START.ps1"
if (Test-Path $v2) {
    $answer = Read-Host "Run C:\Users\bmull\RS3QuestHelperV2\START.ps1 now? (y/n)"
    if ($answer -eq 'y') { & $v2 }
}
exit 1
