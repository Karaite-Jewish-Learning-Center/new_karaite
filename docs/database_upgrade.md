# Upgrade database to new version of Postgres (14 to 17)

```bash
pg_dumpall -U postgres > pg_backup.sql
```

# Stop the database

```bash
sudo systemctl stop postgresql@14-main
```

# Update or install the new version of Postgres

```bash
sudo apt update
sudo apt install postgresql-17
``` 

# Start the new version of Postgres

```bash
sudo systemctl start postgresql@17-main
```

# Restore the database

```bash
psql -U postgres -f pg_backup.sql
```