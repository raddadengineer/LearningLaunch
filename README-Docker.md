# KidLearn App - Docker Setup

This educational app for children can be run locally using Docker with persistent data storage.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed on your system
- At least 2GB of available RAM
- Port 3456 and 5432 available on your machine

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

The PostgreSQL database data is stored in a Docker volume called `postgres_data`. This means:
- Your progress, users, and all data will persist between container restarts
- To completely reset the database, remove the volume: `docker volume rm kidlearn_postgres_data`

### Services

- **App**: Node.js application running on port 3456 (mapped from internal port 5000)
- **Database**: PostgreSQL 15 running on port 5432
- **Volume**: `postgres_data` for persistent database storage

### Environment Variables

The Docker setup includes these pre-configured environment variables:
- `DATABASE_URL`: Connection string for PostgreSQL
- `SESSION_SECRET`: Session encryption key (change in production)
- `NODE_ENV`: Set to production

### Troubleshooting

1. **Port conflicts**: If port 3456 or 5432 are in use, modify the ports in `docker-compose.yml`
2. **Database connection issues**: Check if PostgreSQL service is healthy with `docker-compose ps`
3. **Build failures**: Ensure you have enough disk space and memory
4. **Permission issues**: On Linux, you may need to run with `sudo`

### Development vs Production

This Docker setup is configured for local development with production-like settings. For actual production deployment, you should:
- Change the SESSION_SECRET to a secure random value
- Use environment variable files (.env) instead of hardcoded values
- Configure proper SSL/TLS certificates
- Set up proper backup strategies for the database volume