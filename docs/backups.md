## Manual Backups postgres-backup

```bash
docker exec postgres-backup sh -c 'backup'
```

## Restore from Backup using postgres-backup

```bash
docker exec -it postgres-backup sh -c 'restore <backup-filename>'
```

```bash
    mkdir -p database-backups
    chmod 777 database-backups
```


## Restore data from backup local or server

If file was copied from the server to local machine
Although the extensions is .sql the file is compressed with gzip

```bash
  cd database-backups
  mv 09-25-2025-backup.sql 09-25-2025-backup.gz # rename to add .gz extension
  gunzip 09-25-2025-backup.gz

```bash
  docker exec -i kjoa-postgres psql -U postgres -d karaites < database-backups/09-25-2025-backup.sql
```