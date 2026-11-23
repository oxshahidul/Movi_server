@echo off
setlocal enabledelayedexpansion
title ScreenBox - Local Development Runner

echo =====================================================================
echo                 ScreenBox Cinema & Streaming Platform               
echo =====================================================================
echo.
echo [*] Project Directory : %~dp0
echo [*] Checking Environment...

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in PATH! Please install Node.js.
    pause
    exit /b 1
)

:: Reminder for MySQL / XAMPP
echo [*] Ensure XAMPP MySQL is RUNNING on port 3306.
echo.

echo ---------------------------------------------------------------------
echo [*] Starting Backend (Port 5000)...
echo [*] Starting Frontend (Port 3000)...
echo ---------------------------------------------------------------------

:: Start Backend server in its own titled window
start "ScreenBox - Backend (Port 5000)" cmd /k "cd /d "%~dp0backend" && npm run dev"

:: Start Frontend server in its own titled window
start "ScreenBox - Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo =====================================================================
echo  [+] Both servers are now running!
echo.
echo      - Frontend UI : http://localhost:3000
echo      - Backend API : http://localhost:5000/api/v1
echo      - Admin Panel : http://localhost:3000/admin
echo.
echo  [*] Tip: To stop the servers, simply close the respective terminal windows.
echo =====================================================================
echo.
echo [*] Opening http://localhost:3000 in your default browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo You may close this launcher window at any time.
pause
