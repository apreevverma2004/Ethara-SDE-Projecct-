#!/bin/sh
set -e

echo "⏳  Waiting for PostgreSQL to be ready..."

until python -c "
import os, psycopg2, sys
try:
    psycopg2.connect(os.environ['DATABASE_URL'])
    print('✅  PostgreSQL is ready!')
except Exception as e:
    print(f'Not ready: {e}')
    sys.exit(1)
"; do
  echo "   Retrying in 2 seconds..."
  sleep 2
done

echo "🚀  Starting FastAPI server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
