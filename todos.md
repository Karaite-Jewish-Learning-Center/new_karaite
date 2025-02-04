Docker logs purge
Increase server size to at least 8G memory

Prod/dev 
  Config automatic

CI


Add backup

services:
  postgres-backup:
    image: postgres:16
    restart: unless-stopped
    depends_on:
      - postgres
    volumes:
      - postgres_backups:/backups
    entrypoint: ["sh", "-c", "while true; do pg_dump -U myuser -h postgres -F c mydatabase > /backups/backup_$(date +%Y-%m-%d).dump; sleep 86400; done"]