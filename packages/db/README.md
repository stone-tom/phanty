# `packages/db`

Shared database package for the monorepo.

It provides:

- Drizzle schema exports
- DB client factory for Bun SQL
- Seed scripts
- Atlas/Drizzle migration workflow commands

## Tech Stack

- Drizzle ORM
- Bun SQL driver
- Postgres
- Atlas (for migration apply/status) + Drizzle schema export

## Quick Start

From repository root:

```bash
pnpm install
cp packages/db/.env.example packages/db/.env
pnpm --filter @repo/db typecheck
```

## Scripts

Run from repository root:

- `pnpm --filter @repo/db typecheck` - TypeScript checks
- `pnpm --filter @repo/db db:seed` - seed test data
- `pnpm --filter @repo/db atlas:diff` - create migration diff
- `pnpm --filter @repo/db atlas:rehash` - rehash migration checksums
- `pnpm --filter @repo/db atlas:apply` - apply pending migrations
- `pnpm --filter @repo/db atlas:status` - migration status

Top-level shortcuts also exist in root `package.json`:

- `pnpm db:seed`
- `pnpm atlas:diff`
- `pnpm atlas:rehash`
- `pnpm atlas:apply`
- `pnpm atlas:status`

## Environment Variables

Defined in [`.env.example`](./.env.example):

- `DATABASE_URL` - Postgres connection string
- `MAX_POOL_SIZE` - optional, default `20`
- `IDLE_TIMEOUT` - optional, default `30`
- `MAX_LIFETIME` - optional, default `3600`

## Usage From Other Packages

```ts
import { createDbClient } from '@repo/db';

const db = createDbClient(process.env.DATABASE_URL!);
```

Schema exports are available from `@repo/db` as well:

```ts
import { test } from '@repo/db';
```
