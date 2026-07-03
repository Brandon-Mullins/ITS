@echo off
title RS3 Quest Helper Launcher
color 0E

echo.
echo  ============================================
echo   RS3 Quest Helper - LAUNCHER
echo  ============================================
echo.

set "PROJECT_DIR=%USERPROFILE%\ITS"
cd /d "%PROJECT_DIR%" 2>nul
if not exist "package.json" (
    echo ERROR: Project not found at %PROJECT_DIR%
    echo Run setup-and-run.bat first.
    pause
    exit /b 1
)

:: Kill ALL old copies — including built .exe shortcuts
echo [1/3] Closing any old Quest Helper windows...
taskkill /F /IM electron.exe >nul 2>&1
taskkill /F /IM "RS3 Quest Helper.exe" >nul 2>&1
timeout /t 2 /nobreak >nul

:: Show version from package.json
for /f "tokens=2 delims=:," %%v in ('findstr /C:"\"version\"" package.json') do set VER=%%v
set VER=%VER:"=%
set VER=%VER: =%
echo [2/3] Installed version: v%VER%
echo.

if "%VER%" LSS "0.6.0" (
    echo ERROR: Still on old version. Run OPEN-ME.bat first.
    pause
    exit /b 1
)

:: Clear vite cache so UI always refreshes
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite" 2>nul

echo [3/3] Starting Quest Helper...
echo.
echo  >>> A SEPARATE WINDOW will open (not your browser). <<<
echo  >>> Look for v%VER% in the title bar.              <<<
echo  >>> Click "Fairy Tale II" in the green Official    <<<
echo  >>> Guides section to see the new OSRS-style UI.    <<<
echo.
echo  Keep THIS window open while using the app.
echo.

call npm run electron:dev

echo.
echo App closed.
pause
