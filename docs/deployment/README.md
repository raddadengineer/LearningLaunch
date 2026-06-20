# Deployment

LearningLaunch ships with Docker Compose, Portainer stack, and Docker Hub images.

**Full Docker guide:** [README-Docker.md](../../README-Docker.md)

## Quick start (Docker Hub)

No clone required:

```bash
docker compose -f docker-compose.hub.yml up -d
```

Open **http://localhost:3456**

Or from a cloned repo:

```bash
npm run docker:hub:up
```

## Local build

```bash
npm run docker:up      # build + start
npm run docker:logs    # follow logs
npm run docker:down    # stop
```

## Services

| Service | Host port | Internal | Notes |
|---------|-----------|----------|-------|
| App | 3456 | 5000 | Node.js + static client |
| PostgreSQL | 5433 | 5432 | Data volume `learninglaunch_postgres_data` |

Startup: waits for Postgres → `drizzle-kit push` → serves app.

## Environment variables

| Variable | Default (compose) | Notes |
|----------|-------------------|-------|
| `DATABASE_URL` | `postgresql://...@postgres:5432/learninglaunch` | Required |
| `SESSION_SECRET` | compose default | **Change in production** |
| `NODE_ENV` | `production` | |
| `KOKORO_URL` | `http://host.docker.internal:8880/v1/audio/speech` | Upstream Kokoro-FastAPI for `/api/speech` |
| `KOKORO_VOICE` | `af_heart` | Default voice ID for proxy |

### Kokoro TTS (optional)

For high-quality neural voices, run Kokoro-FastAPI on the host (port 8880). The app proxies requests via `POST /api/speech` — no browser CORS setup needed.

Docker Desktop: `KOKORO_URL=http://host.docker.internal:8880/v1/audio/speech`

Linux Docker: use host LAN IP instead of `host.docker.internal`.

1. Portainer → **Stacks** → **Add stack**
2. Paste `portainer-stack.yml`
3. Update passwords / secrets
4. Deploy

Image: `raddadengineer/learninglaunch:latest`

## Publishing images

Multi-arch (amd64 + arm64):

```bash
npm run docker:push
```

Single-arch local build:

```bash
npm run docker:build
```

Legacy image name `raddadengineer/kidlearn` was replaced by `raddadengineer/learninglaunch`.

## Production checklist

- [ ] Set strong `SESSION_SECRET` and `POSTGRES_PASSWORD`
- [ ] Use `.env` or secrets manager (not hardcoded compose values)
- [ ] Configure SSL/TLS reverse proxy (nginx, Traefik, Caddy)
- [ ] Back up `learninglaunch_postgres_data` volume regularly
- [ ] If using Kokoro TTS, point clients to a reachable speech API URL

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 3456/5433 in use | Change ports in `docker-compose.yml` |
| `exec format error` | Pull multi-arch image: `npm run docker:hub:pull` then recreate |
| DB connection failed | Check `docker compose ps` — Postgres must be healthy |
| Empty content | First startup seeds automatically; check app logs for seed messages |

## Development vs Docker

| Mode | Command | URL |
|------|---------|-----|
| Dev | `npm run dev` | http://localhost:5000 |
| Docker | `npm run docker:up` | http://localhost:3456 |

Dev mode uses `db-switch.ts` to pick Neon/local Postgres based on `DATABASE_URL`.
