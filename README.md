# phanty

Monorepo for the Phanty web app, API, and shared packages.

## Table of Contents

- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Workspace Commands](#workspace-commands)
- [Technical Documentation Index](#technical-documentation-index)
- [Documentation Conventions](#documentation-conventions)

## Repository Structure

```txt
apps/
  api/          Elysia + Bun backend
  web/          React + Vite frontend
packages/
  db/           Shared database layer (Drizzle + Atlas)
  typescript/   Shared TypeScript base config
```

## Getting Started

Prerequisites:

- Node.js `>=24`
- pnpm `10.x`
- Bun (required by API dev/runtime scripts)

Install:

```bash
pnpm install
```

Create local env files:

```bash
cp apps/api/.env.example apps/api/.env
cp packages/db/.env.example packages/db/.env
```

Start docker container:
```bash
docker compose up -d
```

## Workspace Commands

Run from repository root:

- `pnpm dev` - run all package/app dev scripts in parallel
- `pnpm build` - run build scripts across workspace
- `pnpm typecheck` - run TypeScript checks across workspace
- `pnpm lint` - Biome checks at repository level
- `pnpm lint:fix` - apply Biome fixes
- `pnpm format` - format repository with Biome
- `pnpm db:seed` - seed database using `@repo/db`
- `pnpm atlas:diff|atlas:rehash|atlas:apply|atlas:status` - migration workflow helpers

## Technical Documentation Index

Apps:

- [`apps/api/README.md`](./apps/api/README.md) - backend service architecture, env, scripts, routes
- [`apps/web/README.md`](./apps/web/README.md) - frontend stack, scripts, UI tooling

Packages:

- [`packages/db/README.md`](./packages/db/README.md) - DB client/schema/seeding/migration commands
- [`packages/typescript/README.md`](./packages/typescript/README.md) - shared TS config usage

Root/Workspace docs:

- [`README.md`](./README.md) - this file (entrypoint and index)
- [`docs/coolify-deploy.md`](./docs/coolify-deploy.md) - production deployment setup for Coolify

## Documentation Conventions

Recommended approach: keep one README per app/package plus this root index.

- Put cross-cutting docs in root-level `docs/` (create when needed).
- Keep package README focused on setup, commands, env, and local architecture.
- Link between READMEs instead of duplicating details.
- Update docs in the same PR as technical changes.
