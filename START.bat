@echo off
REM Launches RS3 Quest Helper V2 — works from repo root OR app folder
cd /d "%~dp0"
title RS3 Quest Helper V2
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0START.ps1"
if errorlevel 1 (
    echo.
    echo Launch failed. Press any key to close...
    pause >nul
)
