# KJLC Deployment Guide

## Quick Deploy (2 steps)

### 1. Push to GitHub (from your Mac)
```bash
cd /Users/shawn/karaite-texts
git add .
git commit -m "Your commit message"
git push
```

### 2. Deploy via DigitalOcean Console
1. Go to digitalocean.com → Karaites droplet → Access → **Launch Droplet Console**
2. Run these two commands:

```bash
cd /home/production/new_karaite && git pull
```

```bash
docker cp site/. nginx-proxy:/usr/share/nginx/html/
```

Done! Site is live at https://kjlc.karaites.org

---

## Server Details
- **IP**: 137.184.236.140
- **Domain**: kjlc.karaites.org
- **Console**: DigitalOcean → Karaites droplet → Access → Launch Droplet Console

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
