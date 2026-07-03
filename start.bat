@echo off
title RS3 Quest Helper
set "PROJECT_DIR=%USERPROFILE%\ITS"

if not exist "%PROJECT_DIR%\package.json" (
    echo Project not set up yet. Run setup-and-run.bat first.
    pause
    exit /b 1
)

cd /d "%PROJECT_DIR%"
call npm run electron:dev
