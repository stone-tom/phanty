FROM oven/bun:1.3.1-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/typescript/package.json packages/typescript/package.json

RUN pnpm install --frozen-lockfile --filter @repo/api...

COPY package.json pnpm-workspace.yaml ./
COPY apps/api ./apps/api
COPY packages/db ./packages/db
COPY packages/typescript ./packages/typescript

RUN bun build apps/api/src/index.ts --compile --minify --outfile /app/server

FROM arigaio/atlas:latest AS atlas

FROM alpine:3.21 AS runner

WORKDIR /app

RUN apk add --no-cache libstdc++

ENV NODE_ENV=production
ENV API_PORT=3000

COPY --from=build /app/server /app/server
COPY --from=atlas /atlas /usr/local/bin/atlas
COPY packages/db/migrations /app/packages/db/migrations
COPY docker/api-entrypoint.sh /app/api-entrypoint.sh

RUN chmod +x /app/api-entrypoint.sh

EXPOSE 3000

CMD ["/app/api-entrypoint.sh"]
