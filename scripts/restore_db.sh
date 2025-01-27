#!/bin/bash
if [ -z "$1" ]
then
    echo "Please provide backup file path"
    echo "Usage: ./restore_db.sh ./backups/backup_file.sql.gz"
    exit 1
fi

# Decompress if file is gzipped
if [[ $1 == *.gz ]]
then
    gunzip -c "$1" > temp_backup.sql
    BACKUP_FILE="temp_backup.sql"
else
    BACKUP_FILE=$1
fi

# Wait for PostgreSQL to be ready
until docker exec postgres-prod pg_isready -U ${DB_USER}; do
    echo "Waiting for PostgreSQL to be ready..."
    sleep 2
done

# Restore backup
cat ${BACKUP_FILE} | docker exec -i postgres-prod psql -U ${DB_USER} ${DB_NAME}

# Clean up temp file if we created one
if [[ $1 == *.gz ]]
then
    rm temp_backup.sql
fi

echo "Restore completed" 