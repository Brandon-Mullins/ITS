@echo off
echo Close Quest Helper first, then press any key...
pause >nul
powershell -ExecutionPolicy Bypass -File "%~dp0UPDATE.ps1"
pause
