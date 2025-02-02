## Manual Backups

```bash
docker exec postgres-backup sh -c 'backup'
```

## Restore from Backup

```bash
docker exec -it postgres-backup sh -c 'restore <backup-filename>'
```

```bash
    mkdir -p database-backups
    chmod 777 database-backups
```
