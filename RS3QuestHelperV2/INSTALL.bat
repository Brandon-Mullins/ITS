@echo off
REM Double-click to run full install (do not double-click INSTALL.ps1)
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0INSTALL.ps1"
pause
