@echo off
title RS3 Quest Helper - Update and Open
color 0E

echo.
echo  ============================================
echo   RS3 Quest Helper - FORCE UPDATE + OPEN
echo  ============================================
echo.
echo  This closes the old app, downloads v0.6.0,
echo  and opens the new OSRS-style UI.
echo.

set "PROJECT_DIR=%USERPROFILE%\ITS"

:: Close any running copy
echo Closing old Quest Helper...
taskkill /F /IM electron.exe >nul 2>&1
timeout /t 2 /nobreak >nul

if not exist "%PROJECT_DIR%\package.json" (
    echo.
    echo Project not found at %PROJECT_DIR%
    echo Run setup-and-run.bat first, or download the repo.
    pause
    exit /b 1
)

cd /d "%PROJECT_DIR%"

if not exist "%PROJECT_DIR%\UPDATE.ps1" (
    echo UPDATE.ps1 not found - downloading latest from GitHub...
    powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/Brandon-Mullins/ITS/cursor/rs3-quest-helper-mvp1-1b6e/UPDATE.ps1' -OutFile '%PROJECT_DIR%\UPDATE.ps1' -UseBasicParsing"
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%PROJECT_DIR%\UPDATE.ps1"

pause
