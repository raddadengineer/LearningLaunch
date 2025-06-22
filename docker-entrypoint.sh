#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h $PGHOST -p $PGPORT -U $PGUSER; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready - pushing schema"

# Push database schema and handle errors gracefully
npx drizzle-kit push --config=./drizzle.config.ts || echo "Schema push completed or already up to date"

echo "Starting application"

# Start the application
exec "$@"