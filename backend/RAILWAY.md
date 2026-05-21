# Railway backend deployment

## Pre-deploy command (critical)

Leave **Pre-deploy Command** **empty** in the Railway dashboard (Settings → Deploy).

If you see `CommandError: No fixture named 'data' found`, Railway is still running `loaddata data.json` from the dashboard.

**Fix:** Settings → Deploy → clear **Pre-deploy Command** and **Custom Start Command** → Redeploy.

Config-as-code lives in two places (use the one that matches your **Root Directory**):

| Root Directory | Config file used |
|----------------|------------------|
| *(empty / repo root)* | `pfe-talent-center/railway.toml` (`cd backend && …`) |
| `backend` | `backend/railway.toml` (no `cd`) |

Both set `preDeployCommand: []` in `railway.json` to disable dashboard pre-deploy `loaddata`.

## Start command

`backend/railway.toml` and `backend/railway.json` define the start command (`[deploy] startCommand`):

```bash
python manage.py migrate --noinput && python -m gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
```

In the Railway dashboard **Custom Start Command**, leave empty so Railway uses `railway.toml`, or paste the same line above.

No `loaddata`, `data.json`, or `scripts/railway_start.sh`.

## PostgreSQL (required)

1. Add a **PostgreSQL** service in the same Railway project.
2. On the **backend** service → **Variables** → **Add Reference** → Postgres → **`DATABASE_URL`**.
3. Redeploy.

Logs should show `DATABASE_ENGINE = django.db.backends.postgresql`.

## CORS

Set `FRONTEND_ORIGIN` to your exact Vercel URL (no trailing slash).

## Optional local fixture (never in deploy)

```bash
python manage.py migrate
python manage.py loaddata data.json
```

Run only manually on an empty database, never in Pre-deploy or Start commands.
