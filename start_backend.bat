@echo off
title ScreenBox - Backend Server (Port 5000)
chcp 65001 >nul
cls

echo ========================================================
echo         🎬 ScreenBox - Starting Backend Server
echo ========================================================
echo.
echo [*] নিশ্চিত করুন XAMPP MySQL চালু আছে।
echo [*] Directory: %~dp0backend
echo [*] Port: 5000
echo.

cd /d "%~dp0backend"
npm run dev
pause
