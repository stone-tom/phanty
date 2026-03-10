# `apps/web`

Frontend app built with React, Vite, TypeScript, Tailwind CSS v4, and shadcn/ui.

## Tech Stack

- React 19 + React DOM
- Vite
- Tailwind CSS v4 (`@tailwindcss/vite`)
- shadcn/ui + Base UI primitives
- Biome for linting/formatting

## Quick Start

From repository root:

```bash
pnpm install
pnpm --filter @repo/web dev
```

Default Vite URL: `http://localhost:5173`

Create local env file:

```bash
cp apps/web/.env.example apps/web/.env
```

Required variables:

- `VITE_BACKEND_URL` - backend origin used by auth client (example: `http://localhost:4000`)

## Scripts

Run from repository root:

- `pnpm --filter @repo/web dev` - start local dev server
- `pnpm --filter @repo/web build` - typecheck + production build
- `pnpm --filter @repo/web preview` - preview production build
- `pnpm --filter @repo/web typecheck` - TypeScript checks
- `pnpm --filter @repo/web lint` - Biome checks
- `pnpm --filter @repo/web lint:fix` - apply Biome safe fixes
- `pnpm --filter @repo/web format` - format code with Biome

## Project Notes

- Path alias `@` points to `src` (configured in `vite.config.ts` + TS config).
- Theme handling is wired through `ThemeProvider` in `src/main.tsx`.
- Tailwind and React-specific Biome rules are enabled via root `biome.json` overrides for `apps/web/**`.

## UI Components

shadcn config lives in [`components.json`](./components.json).

Example add command:

```bash
pnpm --filter @repo/web exec shadcn add button
```
