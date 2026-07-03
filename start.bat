@echo off
title RS3 Quest Helper
set "PROJECT_DIR=%USERPROFILE%\ITS"

if not exist "%PROJECT_DIR%\package.json" (
    echo Project not set up yet. Run setup-and-run.bat first.
    pause
    exit /b 1
)

cd /d "%PROJECT_DIR%"

:: Show installed version
for /f "tokens=2 delims=:," %%v in ('findstr /C:"\"version\"" package.json') do (
    set VER=%%v
    goto :gotver
)
:gotver
set VER=%VER:"=%
set VER=%VER: =%

echo.
echo  RS3 Quest Helper v%VER%
echo.

if "%VER%"=="0.5.1" (
    echo  *** You are on OLD v0.5.1 ***
    echo  Double-click OPEN-ME.bat to update to v0.6.0 first.
    echo.
    pause
)

call npm run electron:dev
