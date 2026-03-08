# `apps/api`

Backend API built with Elysia and Bun.  
This service exposes versioned endpoints under `/v1`, health checks, and OpenAPI docs.

## Tech Stack

- Elysia
- Bun runtime
- Drizzle ORM via `@repo/db`
- Zod for environment validation

## Quick Start

From repository root:

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm --filter @repo/api dev
```

API listens on `API_PORT` (defaults to `3000` if not set).

## Scripts

Run from repository root:

- `pnpm --filter @repo/api dev` - start API in watch mode using Bun
- `pnpm --filter @repo/api typecheck` - run TypeScript type checking

## Environment Variables

Defined in [`.env.example`](./.env.example):

- `DATABASE_URL` - Postgres connection string
- `API_PORT` - HTTP port (default: `3000`)
- `NODE_ENV` - `development | production | test`
- `MAINTENANCE_MODE` - `true` to return `503` for most routes
- `MAINTENANCE_IGNORE_IPS` - comma-separated allowlist for maintenance mode

## Routes

- `GET /health` - liveness + database connectivity check
- `GET /v1/test` - list rows from `test` table
- `GET /v1/test/:id` - get one row by numeric id

## OpenAPI

OpenAPI is enabled through `@elysiajs/openapi`.  
After starting the server, check the generated docs endpoints exposed by that plugin in your current Elysia version.
