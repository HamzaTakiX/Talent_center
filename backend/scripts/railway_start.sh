#!/usr/bin/env sh
# Railway production entrypoint — NEVER run loaddata here.
set -eu

echo "[railway_start] migrate (PostgreSQL via DATABASE_URL)"
python manage.py migrate --noinput

echo "[railway_start] gunicorn on port ${PORT:-8000}"
exec python -m gunicorn core.wsgi:application --bind "0.0.0.0:${PORT:-8000}"
