@echo off
title ScreenBox - Frontend Server (Port 3000)
chcp 65001 >nul
cls

echo ========================================================
echo         🎬 ScreenBox - Starting Next.js Frontend
echo ========================================================
echo.
echo [*] Directory: %~dp0frontend
echo [*] Port: 3000
echo.

cd /d "%~dp0frontend"
npm run dev
pause
