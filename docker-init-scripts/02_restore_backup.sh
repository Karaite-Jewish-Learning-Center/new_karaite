#!/bin/bash
set -e

# Wait for database to be ready
until PGPASSWORD=$POSTGRES_PASSWORD psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done

# Path to your backup file
BACKUP_FILE="backup.sql"

if [ -f "$BACKUP_FILE" ]; then
    echo "Restoring database from backup..."
    PGPASSWORD=$POSTGRES_PASSWORD psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$BACKUP_FILE"
    echo "Backup restoration completed."
else
    echo "No backup file found at $BACKUP_FILE"
    exit 1
fi 