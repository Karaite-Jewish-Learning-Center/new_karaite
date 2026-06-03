# KJLC Deployment Guide

> **Current hosting**: Netlify (static site deployment from GitHub)
> **Previous hosting**: DigitalOcean (deprecated, see historical notes at bottom)

---

## Quick Deploy

### 1. Commit and Push to GitHub

```bash
cd /Users/shawn/karaite-texts

# Check what's changed
git status

# Stage and commit
git add <files>
git commit -m "Description of changes"

# Push to the branch Netlify watches
# IMPORTANT: Netlify is configured to watch feature/may-2026-updates, NOT main
git push origin HEAD:feature/may-2026-updates
```

### 2. Netlify Auto-Deploys

Netlify automatically detects the push and deploys within ~30 seconds.

**To verify deploy status**:
1. Go to [netlify.com](https://netlify.com) → your site
2. Click **Deploys** in the left sidebar
3. Look for your commit at the top
   - **"Building"** → wait (usually 30-60 seconds)
   - **"Published"** → site is live
   - **"Failed"** → check build log for errors

**To trigger manual deploy** (if auto-deploy didn't fire):
1. Netlify Dashboard → **Deploys**
2. Click **Trigger deploy** → **Clear cache and deploy site**

**Site URL**: https://kjlc.karaites.org

---

## Netlify Configuration

| Setting | Value |
|---------|-------|
| Repository | `github.com/Karaite-Jewish-Learning-Center/new_karaite` |
| Production branch | `feature/may-2026-updates` |
| Build command | *(none — static site)* |
| Publish directory | `.` (repo root) |
| Base directory | *(none — repo root)* |

**Important**: The production branch is `feature/may-2026-updates`, NOT `main`. Pushing to `main` will NOT trigger a deploy.

---

## GitHub ↔ Netlify Connection

If auto-deploy stops working:

1. Go to [netlify.com](https://netlify.com) → your site
2. **Site settings** → **Build & deploy** → **Build settings**
3. Verify:
   - Repository is linked
   - Production branch is `feature/may-2026-updates`
4. If broken, click **Link to a different repository** and re-select

---

## Large File Pushes

The repo contains large files (MP3s, `citations.json` at ~7MB). Pushing may fail with SSL errors:

```
error: RPC failed; curl 55 Send failure: Broken pipe
```

**Solutions**:
1. **Push from a different network** (phone hotspot often works)
2. **Push commits one at a time**:
   ```bash
   git log --oneline origin/feature/may-2026-updates..HEAD
   git push origin <commit-hash>:feature/may-2026-updates
   ```
3. **Increase buffer**:
   ```bash
   git config http.postBuffer 2147483648
   ```

---

## Domain & DNS

- **Primary domain**: `kjlc.karaites.org`
- **Netlify site name**: `legendary-valkyrie-74bdb3.netlify.app`
- DNS is configured at the domain registrar to point to Netlify

---

## GitHub Repo

- **URL**: https://github.com/Karaite-Jewish-Learning-Center/new_karaite
- **Default branch**: `main`
- **Netlify watches**: `feature/may-2026-updates`
- Branch protection rules are currently disabled to allow direct pushes

---

## Historical: DigitalOcean (Deprecated)

The site was previously hosted on DigitalOcean. The following is kept for reference only:

**Server Details** (no longer active):
- IP: 137.184.236.140
- Docker containers: traefik, nginx-proxy, redis, postgres
- Live files: `/home/production/new_karaite_old/frontend/build/`

**Old deploy process**:
```bash
# SSH to server
ssh root@137.184.236.140

# Pull and copy
cd /home/production/new_karaite && git pull
docker cp site/. nginx-proxy:/usr/share/nginx/html/
```

This server has been decommissioned. All deployment now goes through Netlify.

---

*Last updated: 2026-06-02*
