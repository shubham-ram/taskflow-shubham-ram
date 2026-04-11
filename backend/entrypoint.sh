#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Running database seed..."
node dist/prisma/seed.js 2>/dev/null || echo "Seed already applied or skipped."

echo "Starting server..."
exec node dist/index.js
