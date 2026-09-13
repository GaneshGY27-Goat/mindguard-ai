@echo off
title MindGuard AI Prototype Launcher
echo ===================================================
echo     Starting MindGuard AI (Backend ^& Frontend)
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Backend API on http://localhost:5000 ...
start "MindGuard Backend (Port 5000)" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo [2/3] Waiting 3 seconds for backend initialization...
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend UI on http://localhost:3000 ...
start "MindGuard Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Launching your browser at http://localhost:3000 ...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ===================================================
echo MindGuard AI is now running!
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:5000
echo Keep the two opened terminal windows running while using the app.
echo ===================================================
pause
