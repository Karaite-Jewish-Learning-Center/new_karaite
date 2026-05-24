# KJLC Deployment Guide

## Server Details
- **IP**: 137.184.236.140
- **Host**: DigitalOcean Droplet "Karaites"
- **Domain**: kjlc.karaites.org
- **SSH**: `ssh root@137.184.236.140`

## Architecture
- **Traefik** handles SSL and routing
- **nginx-proxy** serves static files
- Files location: `/home/production/new_karaite_old/frontend/build/`
- Docker network: `nginx1_network`

## Deploying Updates

### 1. Push changes to GitHub
```bash
cd /Users/shawn/karaite-texts
git add .
git commit -m "Your commit message"
git push origin main
```

### 2. SSH to server
```bash
ssh root@137.184.236.140
```
Password: (the one you set during root password reset)

### 3. Pull and copy files
```bash
cd /home/production/new_karaite
git pull origin main
cp -r /home/production/new_karaite/site/* /home/production/new_karaite_old/frontend/build/
```

That's it! Changes should be live immediately.

## Troubleshooting

### Site shows blank page
Check nginx config points to correct path:
```bash
docker exec nginx-proxy cat /etc/nginx/conf.d/default.conf
```
Should show: `root /app/build;`

### Container issues
Restart nginx-proxy:
```bash
docker restart nginx-proxy
```

If that doesn't work, recreate it:
```bash
cd /home/production/new_karaite_old
docker-compose up -d --no-deps nginx-proxy
```

### Check running containers
```bash
docker ps
```
Should show: traefik, nginx-proxy, redis, postgres, new_karaite-backend

### View logs
```bash
docker logs nginx-proxy --tail 50
docker logs traefik --tail 50
```

### Git permission error on server
```bash
git config --global --add safe.directory /home/production/new_karaite
```

### SSH permission denied
If SSH key auth fails, use DigitalOcean web console:
1. Go to droplet → Settings → Recovery → Launch Console
2. Login as `root` with the password

To re-enable password auth:
```bash
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
systemctl restart ssh
```

## Key Files on Server

| Location | Purpose |
|----------|---------|
| `/home/production/new_karaite/` | Git repo (source) |
| `/home/production/new_karaite_old/frontend/build/` | Live site files |
| `/home/production/new_karaite_old/docker-compose.yml` | Docker config |
| `/home/production/new_karaite_old/docker-config/nginx/nginx.conf` | Nginx config |

## GitHub
- Repo: https://github.com/Karaite-Jewish-Learning-Center/new_karaite
- Branch protection is currently disabled - consider re-enabling after confirming deployment works
