@echo off
title ScreenBox - Local Server Launcher
chcp 65001 >nul
cls

echo ========================================================
echo         🎬 ScreenBox - Local Development Launcher
echo ========================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js পাওয়া যায়নি! অনুগ্রহ করে Node.js ইন্সটল করুন।
    echo.
    pause
    exit /b 1
)

:: Reminder for MySQL / XAMPP
echo [*] নিশ্চিত করুন XAMPP Control Panel থেকে MySQL चालू (Running) আছে।
echo.

:: 1. Start Backend in separate window
echo [1/2] Backend Server চালু করা হচ্ছে (Port 5000)...
start "ScreenBox [BACKEND - Port 5000]" cmd /k "title ScreenBox - Backend (5000) && cd /d "%~dp0backend" && echo Starting Backend Server on http://localhost:5000 ... && npm run dev"

:: Wait 2 seconds
timeout /t 2 /nobreak >nul

:: 2. Start Frontend in separate window
echo [2/2] Frontend Server চালু করা হচ্ছে (Port 3000)...
start "ScreenBox [FRONTEND - Port 3000]" cmd /k "title ScreenBox - Frontend (3000) && cd /d "%~dp0frontend" && echo Starting Next.js Frontend on http://localhost:3000 ... && npm run dev"

echo.
echo ========================================================
echo  ✅ Backend এবং Frontend সফলভাবে চালু হয়েছে!
echo  - Backend API: http://localhost:5000/api/v1
echo  - Frontend UI: http://localhost:3000
echo ========================================================
echo.
echo ব্রাউজারে সাইট ওপেন করতে ৫ সেকেন্ড অপেক্ষা করা হচ্ছে...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo সার্ভার বন্ধ করতে খোলা টার্মিনাল উইন্ডোগুলো বন্ধ করুন অথবা stop.bat চালান।
pause
