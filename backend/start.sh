#!/bin/sh
set -e

cd /app/backend

echo "Running database migrations..."
alembic -c alembic.ini upgrade head

echo "Starting Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
