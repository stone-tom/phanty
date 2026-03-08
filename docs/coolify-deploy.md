# Coolify Deployment (Monorepo)

This repository is deployed as 3 separate Coolify resources:

1. `phanty-db` (PostgreSQL)
2. `phanty-api` (Elysia/Bun backend, compiled binary + startup migrations)
3. `phanty-web` (Vite static frontend served by Nginx)

## Files Added For Deployment

- API Dockerfile: `docker/api.Dockerfile`
- Web Dockerfile: `docker/web.Dockerfile`
- Web Nginx config: `docker/nginx-web.conf`
- Docker ignore: `.dockerignore`

## 1) Create PostgreSQL Resource

In Coolify:

1. Create a new **Database** resource: PostgreSQL.
2. Use generated credentials (or your own).
3. Start the database and wait for healthy state.
4. Copy the **internal connection string** from the resource details.

Use that value as `DATABASE_URL` for the API resource.

## 2) Create API Resource (`phanty-api`)

Create a new **Application** from this repository.

Recommended settings:

- Build Pack: **Dockerfile**
- Base Directory: repository root (`/`)
- Dockerfile Location: `docker/api.Dockerfile`
- Port: `3000`
- Health check path: `/health`
- Auto Deploy: enabled for your target branch (for example `main`)

`docker/api.Dockerfile` builds the API with `bun build --compile`, then on container start:

1. applies pending Atlas SQL migrations from `packages/db/migrations`
2. starts the compiled API binary

Environment variables:

- `NODE_ENV=production`
- `API_PORT=3000`
- `DATABASE_URL=<internal postgres url from Coolify DB resource>?sslmode=disable` -> sslmode needed so atlas (for migrations) can access it
- `MAINTENANCE_MODE=false`
- `MAINTENANCE_IGNORE_IPS=`
- `RUN_DB_MIGRATIONS=true`

When `RUN_DB_MIGRATIONS=true`, `DATABASE_URL` must be set to a valid Postgres URL (for example `postgres://user:pass@host:5432/dbname`).

Then assign a domain (example: `api.example.com`).

## 3) Create Web Resource (`phanty-web`)

Create another **Application** from the same repository.

Recommended settings:

- Build Pack: **Dockerfile**
- Base Directory: repository root (`/`)
- Dockerfile Location: `docker/web.Dockerfile`
- Port: `80`
- Auto Deploy: enabled for your target branch

Frontend env variables (when needed):

- `VITE_API_URL=https://api.example.com`

Then assign a domain (example: `app.example.com`).

## 4) Deploy Behavior On Push

For each app resource (`phanty-api`, `phanty-web`):

1. Ensure git provider webhook is connected.
2. Enable Auto Deploy.
3. Restrict to the deployment branch (`main` or your chosen branch).

Every push to that branch triggers an independent rebuild/redeploy for each service.

## Notes

- Keep FE and BE separate so rollbacks and scaling are independent.
- Keep PostgreSQL as a dedicated Coolify database resource (not in the app container).
- With the current API container, migrations run automatically at startup when `RUN_DB_MIGRATIONS=true`.
- If you later scale API to more than one replica, run migrations from only one instance (or set `RUN_DB_MIGRATIONS=false` on secondary replicas).
