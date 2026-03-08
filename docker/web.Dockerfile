FROM node:24-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/typescript/package.json packages/typescript/package.json

RUN pnpm install --frozen-lockfile --filter @repo/web...

COPY apps/web ./apps/web
COPY packages/typescript ./packages/typescript

RUN pnpm --filter @repo/web build

FROM nginx:1.27-alpine AS runner

COPY docker/nginx-web.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
