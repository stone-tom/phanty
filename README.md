# Project Summary

This project is a **TypeScript Monorepo** managed with **Turbo** and **pnpm**, structured for high performance and scalability.

### Core Stack
*   **Backend:** [Elysia.js](https://elysiajs.com/) running on **Bun** for the API, with **Drizzle ORM** for database interactions.
*   **Frontend:** **React 19** powered by **Vite**, featuring **TanStack Router**, **Tailwind CSS 4**, and **Shadcn UI**.
*   **Background Jobs:** **BullMQ** for distributed task processing via a dedicated worker service.
*   **Database & Cache:** **Postgres 18** and **Dragonfly** (Redis-compatible).

### Infrastructure & Operations (Planned/Current)
*   **Hosting:** Hetzner Dedicated/Big Box.
*   **Proxy & Network:** **Traefik** as the reverse proxy.
*   **Observability:** Full LGTM stack (Loki, Grafana, Tempo, Mimir/Prometheus) with **OpenTelemetry (OTEL)** and **Promtail**.
*   **Error Tracking:** Bugsink or Glitchtip.
*   **Backup Strategy:** 
    *   **DB:** WAL Stream to Hetzner S3 → Storage Box → On-prem NAS.
    *   **Files:** S3 → Restic (Encrypted) → Storage Box → On-prem NAS.

### Tooling
*   **Linting/Formatting:** Biome.
*   **Type Safety:** End-to-end TypeScript with Zod for schema validation.
