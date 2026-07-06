@echo off
REM Double-click this file to launch RS3 Quest Helper V2.
REM (.ps1 files open in Notepad if you double-click them — use this instead.)
cd /d "%~dp0"
title RS3 Quest Helper V2
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0START.ps1"
if errorlevel 1 (
    echo.
    echo Launch failed. Press any key to close...
    pause >nul
)
