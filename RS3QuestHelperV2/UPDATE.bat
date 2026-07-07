@echo off
title RS3 Quest Helper V2 - Update
echo.
echo This installs a FLAT copy to C:\Users\bmull\RS3QuestHelperV2
echo (not nested inside another RS3QuestHelperV2 folder)
echo.
pause

cd /d C:\Users\bmull

taskkill /F /IM electron.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

if exist RS3QuestHelperV2-tmp rmdir /s /q RS3QuestHelperV2-tmp
if exist RS3QuestHelperV2 rmdir /s /q RS3QuestHelperV2

git clone --branch cursor/rasial-roadmap-1b6e --single-branch https://github.com/Brandon-Mullins/ITS.git RS3QuestHelperV2-tmp
if errorlevel 1 goto :failed

move RS3QuestHelperV2-tmp\RS3QuestHelperV2 RS3QuestHelperV2
rmdir /s /q RS3QuestHelperV2-tmp

cd RS3QuestHelperV2
call npm install
if errorlevel 1 goto :failed
call npm run electron:fix
if errorlevel 1 goto :failed

echo.
echo SUCCESS. Launch with:
echo   cd C:\Users\bmull\RS3QuestHelperV2
echo   START.bat
echo.
pause
call START.bat
exit /b 0

:failed
echo.
echo Update failed.
pause
exit /b 1
