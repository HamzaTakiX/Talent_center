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

## PostgreSQL (required)

The backend **must** receive Postgres credentials from Railway.

1. Create a **PostgreSQL** service in the same project.
2. Open the **backend** service (not Postgres) → **Variables**.
3. Click **+ New Variable** → **Add Reference** → choose the Postgres service.
4. Select **`DATABASE_URL`** (or `DATABASE_PRIVATE_URL` for internal networking).
5. Save and **Redeploy** the backend.

After deploy, logs must show:

```text
DATABASE_ENGINE = django.db.backends.postgresql
DATABASE_HOST = ...
```

If you see `RuntimeError: Railway: no PostgreSQL URL found`, the reference was not added to the **backend** service.

Alternative: copy the full URL from Postgres → **Connect** → paste as raw variable `DATABASE_URL` on the backend service.

## CORS

Set `FRONTEND_ORIGIN` to your exact Vercel URL (no trailing slash).

## Manual data import (optional, one-off)

After a successful deploy with migrations:

```bash
python manage.py migrate
python manage.py loaddata data.json
```

Never run `loaddata` in the container start command.
