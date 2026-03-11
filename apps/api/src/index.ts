import { cors } from '@elysiajs/cors';
import openapi from '@elysiajs/openapi';
import { auth } from '@repo/auth/server';
import { createLogger } from '@repo/logger';
import { Elysia } from 'elysia';
import { env } from './env';
import { v1 } from './modules/v1';
import { healhcheck } from './plugins/healtcheck';
import { logPLugin } from './plugins/logger';
import { maintenance } from './plugins/maintenance';

const globalLogger = createLogger('api', 'global');
const app = new Elysia()
  .use(
    cors({
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .mount(auth.handler)
  .use(maintenance)
  .use(openapi())
  .use(logPLugin)
  .use(healhcheck)
  .use(v1)
  .listen(env.API_PORT);

globalLogger.info(
  `Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
