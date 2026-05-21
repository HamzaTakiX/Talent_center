#!/usr/bin/env sh
# Railway production: migrate on every deploy; loaddata only on empty DB (or RUN_LOADDATA=1).
set -eu

echo "[railway_start] migrate (PostgreSQL via DATABASE_URL)"
python manage.py migrate --noinput

if [ -f data.json ]; then
  if [ "${RUN_LOADDATA:-}" = "1" ]; then
    echo "[railway_start] loaddata data.json (RUN_LOADDATA=1)"
    python manage.py loaddata data.json
  elif python -c "
import os, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()
from django.contrib.auth.models import User
sys.exit(0 if User.objects.exists() else 1)
"; then
    echo "[railway_start] skip loaddata — database already seeded (set RUN_LOADDATA=1 to force on empty DB only)"
  else
    echo "[railway_start] loaddata data.json (empty database)"
    python manage.py loaddata data.json
  fi
else
  echo "[railway_start] skip loaddata — data.json not found"
fi

echo "[railway_start] gunicorn on port ${PORT:-8000}"
exec python -m gunicorn core.wsgi:application --bind "0.0.0.0:${PORT:-8000}"
