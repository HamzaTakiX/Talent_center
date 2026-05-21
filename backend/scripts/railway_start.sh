#!/usr/bin/env sh
# Railway production entrypoint: migrate BEFORE loaddata, then gunicorn.
set -eu

echo "[railway_start] migrate (PostgreSQL via DATABASE_URL)"
python manage.py migrate --noinput

if [ -f data.json ]; then
  echo "[railway_start] loaddata data.json (sessions excluded from fixture)"
  python manage.py loaddata data.json
else
  echo "[railway_start] skip loaddata — data.json not found"
fi

echo "[railway_start] gunicorn on port ${PORT:-8000}"
exec python -m gunicorn core.wsgi:application --bind "0.0.0.0:${PORT:-8000}"
