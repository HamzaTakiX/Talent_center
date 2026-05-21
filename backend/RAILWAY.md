# Railway backend deployment

## Start command (required)

Use **only** (matches `railway.toml` and `Procfile`):

```bash
sh scripts/railway_start.sh
```

Or paste the same in the Railway dashboard **Custom Start Command**.

The script runs in this order:

1. `python manage.py migrate --noinput`
2. `loaddata data.json` **only if the database is empty** (no `auth.User` rows), or if you set `RUN_LOADDATA=1` on a **fresh** Postgres (never on a DB that already has data — causes `UniqueViolation`)
3. `gunicorn`

**Do not** override with `loaddata` before `migrate` — that causes `relation "django_session" does not exist`.

**Do not** run `loaddata` on every deploy — partial imports then retries cause duplicate key errors.

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

## Regenerate `data.json` (local, UTF-8, no sessions)

From `backend/` with venv active and DB migrated:

```bash
python -X utf8 manage.py dumpdata --exclude auth.permission --exclude contenttypes --exclude sessions > data.json
```

Or strip sessions from an existing fixture:

```bash
python scripts/strip_fixture_sessions.py data.json
```
