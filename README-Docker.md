# LearningLaunch App - Docker Setup

This educational app for children can be run locally using Docker with persistent data storage.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed on your system
- At least 2GB of available RAM
- Port 3456 and 5433 available on your machine

### Running from Docker Hub (no clone required)

Use `docker-compose.hub.yml` to pull the published image instead of building locally:

```bash
docker compose -f docker-compose.hub.yml up -d
```

Or with npm (from a cloned repo):

```bash
npm run docker:hub:up
```

Open **http://localhost:3456**. The app waits for Postgres, runs `drizzle-kit push` on startup, then serves.

To update after a new image is published:

```bash
docker compose -f docker-compose.hub.yml pull
docker compose -f docker-compose.hub.yml up -d
```

Change `SESSION_SECRET` and `POSTGRES_PASSWORD` in the compose file before any real deployment.

### Running the Application

1. **Build and start the application:**
   ```bash
   npm run docker:up
   ```

2. **Access the application:**
   - Open your browser to: http://localhost:3456
   - The app will be ready once both services are healthy

3. **View logs:**
   ```bash
   npm run docker:logs
   ```

4. **Stop the application:**
   ```bash
   npm run docker:down
   ```

### Data Persistence

The PostgreSQL database data is stored in a Docker volume called `learninglaunch_postgres_data`. This means:
- Your progress, users, and all data will persist between container restarts
- To completely reset the database, remove the volume: `docker volume rm learninglaunch_postgres_data`

### Services

- **App**: Node.js application running on port 3456 (mapped from internal port 5000)
- **Database**: PostgreSQL 15 running on port 5433 (mapped from internal port 5432)
- **Volume**: `learninglaunch_postgres_data` for persistent database storage

### Environment Variables

The Docker setup includes these pre-configured environment variables:
- `DATABASE_URL`: Connection string for PostgreSQL
- `SESSION_SECRET`: Session encryption key (change in production)
- `NODE_ENV`: Set to production

### Troubleshooting

1. **Port conflicts**: If port 3456 or 5433 are in use, modify the ports in `docker-compose.yml`
2. **`exec format error` on startup**: The published image must match your server CPU. Images pushed with `npm run docker:push` are multi-arch (`linux/amd64` + `linux/arm64`). After a fix, run `docker compose -f docker-compose.hub.yml pull` and recreate the container.
3. **Database connection issues**: Check if PostgreSQL service is healthy with `docker-compose ps`
4. **Build failures**: Ensure you have enough disk space and memory
5. **Permission issues**: On Linux, you may need to run with `sudo`

### Portainer Deployment

For a GUI-managed deployment, we've provided a ready-to-use `portainer-stack.yml` file. This avoids the need to set up local command-line Docker environments:
1. Open up your Portainer dashboard.
2. Navigate to **Stacks** > **Add stack**.
3. Copy and paste the full contents of `portainer-stack.yml` into the Web editor.
4. Modify any environment variables or passwords directly in the YAML or utilizing Portainer's "Environment variables" tools at the bottom.
5. Click **Deploy the stack**.

The stack pulls the published image **`raddadengineer/learninglaunch:latest`** from Docker Hub.

### Publishing to Docker Hub

To build and publish a new **multi-architecture** image (AMD64 + ARM64) for Docker Hub:

```bash
npm run docker:push
```

For a local-only single-arch build:

```bash
npm run docker:build
```

Or manually (multi-arch publish):

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t raddadengineer/learninglaunch:latest --push .
```

*Note: The legacy `raddadengineer/kidlearn` image has been replaced by `raddadengineer/learninglaunch`.*

### Development vs Production

This Docker setup is configured for local development with production-like settings. For actual production deployment, you should:
- Change the SESSION_SECRET to a secure random value
- Use environment variable files (.env) instead of hardcoded values
- Configure proper SSL/TLS certificates
- Set up proper backup strategies for the database volume