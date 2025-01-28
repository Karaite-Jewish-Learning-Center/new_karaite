# Project Deployment Guide

## Development Setup

Start the development environment:

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin: http://localhost:8000/admin

## Production Deployment

### Prerequisites
1. Ensure all scripts are executable:
```bash
mkdir -p backups
```

### Database Management

Create a backup of development database:
```bash
./scripts/backup_db.sh
```

Restore a specific backup:
```bash
./scripts/restore_db.sh ./backups/backup_file.sql.gz
```

### Deployment

Deploy to production (includes database backup and restore):
```bash
./scripts/deploy_prod.sh
```

This will:
1. Pull latest changes from main branch
2. Backup development database
3. Stop production services
4. Start PostgreSQL
5. Restore latest backup
6. Start all services

### Environment Files

Development:
- `.env` - Development environment variables

Production:
- `.env.prod` - Production environment variables

Required environment variables:
```plaintext
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DOMAIN=your.domain.com
LETSENCRYPT_EMAIL=your@email.com
SECRET_KEY=your_django_secret_key
```

### Docker Commands

View running containers:
```bash
docker-compose ps  # Development
docker-compose -f docker-compose.prod.yml ps  # Production
```

View logs:
```bash
docker-compose logs  # Development
docker-compose -f docker-compose.prod.yml logs  # Production
```

Stop all services:
```bash
docker-compose down  # Development
docker-compose -f docker-compose.prod.yml down  # Production
```

### Maintenance

Backup files are stored in `./backups/` directory with timestamp:
- Format: `backup_YYYYMMDD_HHMMSS.sql.gz`
- Location: `./backups/`

### Troubleshooting

1. If database connection fails:
   - Check if PostgreSQL is running
   - Verify environment variables
   - Check logs: `docker-compose logs postgres-prod`

2. If SSL certificates aren't working:
   - Verify domain DNS settings
   - Check Traefik logs: `docker-compose logs traefik`

3. If restore fails:
   - Ensure backup file exists and is not corrupted
   - Check PostgreSQL logs
   - Verify database credentials