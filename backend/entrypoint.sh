#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Running database seed..."
npx tsx prisma/seed.ts 2>/dev/null || echo "Seed already applied or skipped."

echo "Starting server..."
exec node dist/index.js
