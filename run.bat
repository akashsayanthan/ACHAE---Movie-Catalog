@echo off
title REEL — Film Catalog
echo.
echo  =============================================
echo   REEL — Film Catalog Application
echo   Team ACHAE
echo  =============================================
echo.

:: Check Node is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Node.js is not installed.
    echo  Please download it from https://nodejs.org and re-run this script.
    pause
    exit /b 1
)

cd /d "%~dp0my-react-app"

echo  [1/3] Installing dependencies...
call npm install --silent
if %errorlevel% neq 0 (
    echo  ERROR: npm install failed. Check your internet connection.
    pause
    exit /b 1
)

echo  [2/3] Building the application...
call npm run build
if %errorlevel% neq 0 (
    echo  ERROR: Build failed. See output above for details.
    pause
    exit /b 1
)

echo  [3/3] Starting local server...
echo.
echo  =============================================
echo   App running at: http://localhost:4173
echo   Press Ctrl+C to stop the server.
echo  =============================================
echo.

call npm run preview -- --port 4173 --host
pause