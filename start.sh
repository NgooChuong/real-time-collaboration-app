#!/bin/sh

echo "⏳ Waiting for Postgres to be ready..."
until nc -z postgres 5432; do
  sleep 1
done

echo "✅ Postgres is ready!"


echo "✅ Postgres ready, running Prisma migrate..."
npx prisma migrate deploy || npx prisma db push
echo "✅ Prisma migrate completed."
