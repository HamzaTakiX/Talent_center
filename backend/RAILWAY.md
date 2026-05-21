# Railway backend deployment

## Start command (required)

Use **only**:

```bash
sh scripts/railway_start.sh
```

Or in the Railway dashboard **Custom Start Command**, paste exactly:

```bash
sh scripts/railway_start.sh
```

**Do not** use `loaddata`, `data.json`, or `|| true` in the start command.

## PostgreSQL

1. Create a Postgres plugin on Railway.
2. On the **backend** service → **Variables** → reference `DATABASE_URL` from Postgres.
3. Redeploy. Logs must show:
   - `DATABASE_ENGINE = django.db.backends.postgresql`
   - not `sqlite3`

## CORS

Set `FRONTEND_ORIGIN` to your exact Vercel URL (no trailing slash).

## Manual data import (optional, one-off)

After a successful deploy with migrations:

```bash
python manage.py migrate
python manage.py loaddata data.json
```

Never run `loaddata` in the container start command.
