@echo off
setlocal EnableDelayedExpansion

title RS3 Quest Helper - Setup and Launch
color 0E

echo.
echo  ============================================
echo   RS3 Quest Helper Overlay - Setup and Launch
echo  ============================================
echo.

:: Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo.
    echo 1. Download Node.js 20 LTS from: https://nodejs.org/
    echo 2. Install it (keep defaults)
    echo 3. Double-click this file again
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [OK] Node.js: %NODE_VER%

set "PROJECT_DIR=%USERPROFILE%\ITS"
set "REPO_URL=https://github.com/Brandon-Mullins/ITS.git"
set "BRANCH=cursor/rs3-quest-helper-mvp1-1b6e"
set "ZIP_URL=https://github.com/Brandon-Mullins/ITS/archive/refs/heads/%BRANCH%.zip"

:: Clone, download, or update project
if not exist "%PROJECT_DIR%\package.json" (
    echo.
    echo [1/4] Setting up project in %PROJECT_DIR% ...

    where git >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo        Using Git clone...
        if exist "%PROJECT_DIR%" rmdir /s /q "%PROJECT_DIR%" 2>nul
        git clone --branch %BRANCH% --single-branch %REPO_URL% "%PROJECT_DIR%"
        if !ERRORLEVEL! neq 0 goto :download_zip
    ) else (
        :download_zip
        echo        Downloading from GitHub...
        if exist "%PROJECT_DIR%" rmdir /s /q "%PROJECT_DIR%" 2>nul
        mkdir "%PROJECT_DIR%" 2>nul
        powershell -NoProfile -Command "try { Invoke-WebRequest -Uri '%ZIP_URL%' -OutFile '%TEMP%\ITS.zip' -UseBasicParsing; Expand-Archive -Path '%TEMP%\ITS.zip' -DestinationPath '%TEMP%\ITS-extract' -Force; $folder = Get-ChildItem '%TEMP%\ITS-extract' | Select-Object -First 1; Move-Item $folder.FullName '%PROJECT_DIR%' } catch { exit 1 }"
        if !ERRORLEVEL! neq 0 (
            echo [ERROR] Download failed. Check your internet connection.
            pause
            exit /b 1
        )
    )
) else (
    echo.
    echo [1/4] Project found at %PROJECT_DIR%
    cd /d "%PROJECT_DIR%"
    where git >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        git fetch origin %BRANCH% 2>nul
        git checkout %BRANCH% 2>nul
        git pull origin %BRANCH% 2>nul
    )
)

cd /d "%PROJECT_DIR%"
if not exist "package.json" (
    echo [ERROR] Setup failed - package.json not found.
    pause
    exit /b 1
)
echo [OK] Project ready.

:: Install dependencies
echo.
echo [2/4] Installing dependencies (first run may take 1-2 minutes) ...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)
echo [OK] Dependencies installed.

:: Seed quest data
if not exist "data\quest-index.json" (
    echo.
    echo [3/4] Downloading quest database from Wiki ...
    call npm run seed
) else (
    echo.
    echo [3/4] Quest database ready.
)

:: Launch
echo.
echo [4/4] Launching RS3 Quest Helper overlay ...
echo.
echo  The overlay window should open in a few seconds.
echo  Keep this window open while using the app.
echo.
echo  Next time, just run start.bat in the same folder.
echo.

call npm run electron:dev

echo.
echo App closed.
pause
endlocal
