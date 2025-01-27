#!/bin/bash
set -e

# Pull latest changes
git pull origin main

# Create backup directory if it doesn't exist
mkdir -p backups

# Create backup of development database
./scripts/backup_db.sh

# Bring down existing production services
docker-compose -f docker-compose.prod.yml down

# Start PostgreSQL container first
docker-compose -f docker-compose.prod.yml up -d postgres

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Restore latest backup
latest_backup=$(ls -t backups/*.sql.gz | head -n1)
./scripts/restore_db.sh "$latest_backup"

# Start remaining services
docker-compose -f docker-compose.prod.yml up -d

echo "Deployment completed" 