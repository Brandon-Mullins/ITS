@echo off
setlocal
cd /d "%~dp0"
title RS3 Quest Helper V2 - Quick Update

echo.
echo Quick update to latest fix branch (cursor/inv-fix-1b6e)
echo Folder: %CD%
echo.

if not exist "package.json" (
    if exist "RS3QuestHelperV2\package.json" (
        cd /d "%~dp0RS3QuestHelperV2"
        echo Using nested folder: %CD%
    ) else (
        echo ERROR: Not in RS3QuestHelperV2 folder. Run UPDATE.bat for fresh install.
        pause
        exit /b 1
    )
)

taskkill /F /IM electron.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

git fetch origin cursor/inv-fix-1b6e
if errorlevel 1 goto :failed

git checkout cursor/inv-fix-1b6e
if errorlevel 1 goto :failed

git pull origin cursor/inv-fix-1b6e
if errorlevel 1 goto :failed

call npm install
if errorlevel 1 goto :failed
call npm run electron:fix
if errorlevel 1 goto :failed

for /f "delims=" %%V in ('node -p "require('./package.json').version"') do set APPVER=%%V
echo.
echo Updated to v%APPVER%. Launching...
echo.
call START.bat
exit /b 0

:failed
echo.
echo Quick update failed. Try UPDATE.bat for a full reinstall.
pause
exit /b 1
