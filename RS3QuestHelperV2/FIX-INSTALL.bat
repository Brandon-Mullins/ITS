@echo off
title RS3 Quest Helper V2 - Fix Install
cd /d "%~dp0"
echo.
echo Running fix install - watch for errors below...
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0FIX-INSTALL.ps1"
echo.
echo Exit code: %ERRORLEVEL%
pause
