@echo off
title Push MindGuard AI to GitHub
echo ===================================================
echo       Pushing MindGuard AI to GitHub
echo       Repo: https://github.com/GaneshGY27-Goat/mindguard-ai
echo ===================================================
echo.

cd /d "%~dp0"

echo Staging any modified files...
git add .

echo Creating commit (if changes exist)...
git commit -m "update: MindGuard AI prototype updates" 2>nul

echo Pushing main branch to origin...
git push -u origin main

echo.
echo ===================================================
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Code pushed successfully to GitHub!
    echo View repository at: https://github.com/GaneshGY27-Goat/mindguard-ai
) else (
    echo [NOTE] If push failed, make sure:
    echo 1. You created the repository 'mindguard-ai' on https://github.com/new
    echo 2. You are signed into GitHub
)
echo ===================================================
pause
