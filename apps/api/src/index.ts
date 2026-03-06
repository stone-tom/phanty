import openapi from '@elysiajs/openapi';
import { createLogger } from '@repo/logger';
import { Elysia } from 'elysia';
import { env } from './env';
import { v1 } from './modules/v1';
import { logPLugin } from './plugins/logger';
import { maintenance } from './plugins/maintenance';

const globalLogger = createLogger('api', 'global');

const app = new Elysia()
  .use(maintenance)
  .use(openapi())
  .use(logPLugin)
  .use(v1)
  .listen(env.API_PORT);

globalLogger.info(
  `Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
