@echo off
setlocal
title RS3 Quest Helper V2 - Fresh Install
echo.
echo ================================================
echo   FRESH INSTALL - v0.7.4-ATTACH-FIX branch
echo ================================================
echo.
echo This DELETES the old C:\Users\bmull\RS3QuestHelperV2 folder
echo and installs a clean copy. Required when version stays on v0.7.1.
echo.
pause

cd /d C:\Users\bmull

taskkill /F /IM electron.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Removing old installs...
if exist RS3QuestHelperV2 rmdir /s /q RS3QuestHelperV2
if exist RS3QuestHelperV2-tmp rmdir /s /q RS3QuestHelperV2-tmp

echo Cloning latest fix branch...
git clone --branch cursor/inv-fix-1b6e --single-branch https://github.com/Brandon-Mullins/ITS.git RS3QuestHelperV2-tmp
if errorlevel 1 goto :failed

echo Installing app folder...
move RS3QuestHelperV2-tmp\RS3QuestHelperV2 RS3QuestHelperV2
if errorlevel 1 goto :failed
rmdir /s /q RS3QuestHelperV2-tmp

cd RS3QuestHelperV2

echo.
for /f "delims=" %%V in ('node -p "require('./package.json').version"') do set APPVER=%%V
echo Detected version: v%APPVER%
echo %APPVER% | findstr /C:"0.7.4" >nul
if errorlevel 1 (
    echo.
    echo ERROR: Expected v0.7.4-ATTACH-FIX but got v%APPVER%
    echo Something went wrong with the download.
    goto :failed
)

call npm install
if errorlevel 1 goto :failed
call npm run electron:fix
if errorlevel 1 goto :failed

echo.
echo SUCCESS - v%APPVER% installed at:
echo   C:\Users\bmull\RS3QuestHelperV2
echo.
echo Launching...
call START.bat
exit /b 0

:failed
echo.
echo Install failed. Copy this window and ask for help.
pause
exit /b 1
