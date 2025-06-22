#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h $PGHOST -p $PGPORT -U $PGUSER; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready - starting application"

# Push database schema
npm run db:push

# Start the application
exec "$@"