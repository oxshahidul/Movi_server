@echo off
setlocal

:: ScreenBox Automated MySQL Database Backup for Windows XAMPP
set "BACKUP_DIR=%~dp0..\backups"
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "dt=%%I"
set "TIMESTAMP=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%_%dt:~8,2%-%dt:~10,2%-%dt:~12,2%"
set "BACKUP_FILE=%BACKUP_DIR%\screenbox_db_%TIMESTAMP%.sql"

echo [ScreenBox] Starting database backup...
echo [ScreenBox] Target: %BACKUP_FILE%

"D:\Xampp\mysql\bin\mysqldump.exe" -u root screenbox_db > "%BACKUP_FILE%"

if %ERRORLEVEL% equ 0 (
    echo [ScreenBox] Backup completed successfully!
) else (
    echo [ScreenBox] Backup failed with error code %ERRORLEVEL%
)

endlocal
