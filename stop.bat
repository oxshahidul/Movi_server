@echo off
title ScreenBox - Stop Servers
chcp 65001 >nul
cls

echo ========================================================
echo       🛑 Stopping ScreenBox Local Servers
echo ========================================================
echo.

echo [1/2] Port 5000 (Backend) বন্ধ করা হচ্ছে...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo [2/2] Port 3000 (Frontend) বন্ধ করা হচ্ছে...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo ========================================================
echo  ✅ ScreenBox সার্ভার সফলভাবে বন্ধ করা হয়েছে!
echo ========================================================
timeout /t 3 >nul
