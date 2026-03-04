import { Elysia } from 'elysia';
import { env } from './env';
import { logPLugin } from './plugins/logger';
import { createLogger } from '@repo/logger';

const globalLogger = createLogger('api', 'global');

const app = new Elysia()
  .use(logPLugin)
  .get('/', () => 'Hello Elysia')
  .listen(env.API_PORT);

globalLogger.info(
  `Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
