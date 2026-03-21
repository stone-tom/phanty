import { cors } from '@elysiajs/cors';
import openapi from '@elysiajs/openapi';
import { createLogger } from '@repo/logger';
import { Elysia } from 'elysia';
import { env } from './env';
import { auth } from './lib/auth';
import { db } from './lib/db';
import { mailer } from './lib/mailer';
import { redisClient } from './lib/redis';
import { v1 } from './modules/v1';
import { errorPlugin } from './plugins/error-handler';
import { healhcheck } from './plugins/healtcheck';
import { logPLugin } from './plugins/logger';
import { maintenance } from './plugins/maintenance';
import { allQueues } from './queues';

let isShuttingDown = false;

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
  .use(errorPlugin)
  .use(healhcheck)
  .use(v1)
  .listen(env.API_PORT);

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) {
    globalLogger.warn('Shutdown already in progress, ignoring...');
    return;
  }
  isShuttingDown = true;
  globalLogger.info(`${signal} received. Draining connections...`);

  const forceExit = setTimeout(() => {
    globalLogger.error('Shutdown timeout exceeded. Forcing exit.');
    process.exit(1);
  }, 10000);

  try {
    await app.stop();
    redisClient.close();
    await mailer.close();
    await db.$client.close();
    await Promise.all(Object.values(allQueues).map((queue) => queue.close()));
    clearTimeout(forceExit);
    globalLogger.info('Shutdown completed');
    process.exit(0);
  } catch (err) {
    globalLogger.error(err, 'Shutdown error');
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

globalLogger.info(
  `Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
