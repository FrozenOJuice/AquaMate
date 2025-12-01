#!/bin/sh
set -e

cd /app/backend

echo "Running database migrations..."
alembic -c alembic.ini upgrade head || {
  echo "Migrations failed, stamping current state as head (database may already be initialized)..."
  alembic -c alembic.ini stamp head
}

echo "Starting Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
