@echo off
setlocal
cd /d "%~dp0"
title RS3 Quest Helper V2

echo.
echo ================================================
echo   RS3 QUEST HELPER V2
echo ================================================
echo.

taskkill /F /IM electron.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

if not exist "package.json" (
    echo ERROR: package.json not found in %CD%
    echo Run INSTALL.bat first.
    pause
    exit /b 1
)

findstr /C:"rs3-quest-helper-v2" package.json >nul
if errorlevel 1 (
    echo ERROR: Wrong project folder. Expected rs3-quest-helper-v2 in package.json
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 goto :failed
)

if not exist "node_modules\electron\dist\electron.exe" (
    echo Fixing Electron...
    call npm run electron:fix
    if errorlevel 1 goto :failed
)

call npm run clean
if errorlevel 1 goto :failed

echo.
echo Starting app - look for v0.7.0-RASIAL-ROADMAP in the footer.
echo.
call npm run electron:dev
if errorlevel 1 goto :failed
exit /b 0

:failed
echo.
echo Launch failed.
pause
exit /b 1
