#!/bin/bash
# ScreenBox Automated Database Backup Script for Linux / Production

BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/screenbox_db_$TIMESTAMP.sql.gz"

DB_USER=${DB_USER:-"screenbox_user"}
DB_PASSWORD=${DB_PASSWORD:-"screenbox_password"}
DB_NAME=${DB_NAME:-"screenbox_db"}
DB_HOST=${DB_HOST:-"localhost"}

echo "[ScreenBox] Starting backup of $DB_NAME from $DB_HOST..."

mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "[ScreenBox] Backup successful: $BACKUP_FILE"
    # Rotate backups: retain only last 7 days
    find "$BACKUP_DIR" -type f -name "screenbox_db_*.sql.gz" -mtime +7 -delete
else
    echo "[ScreenBox] Backup failed!"
    exit 1
fi
