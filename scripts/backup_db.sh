#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_${TIMESTAMP}.sql"

# Create backup
docker exec postgres pg_dump -U ${DB_USER} ${DB_NAME} > "./backups/${BACKUP_FILE}"

# Compress backup
gzip "./backups/${BACKUP_FILE}"

echo "Backup created: ./backups/${BACKUP_FILE}.gz" 