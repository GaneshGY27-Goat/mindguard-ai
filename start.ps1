# MindGuard AI - 1-Click PowerShell Launcher
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "     Starting MindGuard AI (Backend & Frontend)    " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/3] Starting Backend API on http://localhost:5000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\backend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting Frontend UI on http://localhost:3000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\frontend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "[3/3] Launching your browser at http://localhost:3000 ..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "MindGuard AI is now running!" -ForegroundColor Green
Write-Host "- Frontend: http://localhost:3000"
Write-Host "- Backend:  http://localhost:5000"
Write-Host "Keep the opened PowerShell windows open while using the app."
