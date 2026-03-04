import { createLogger } from '@repo/logger';
import Elysia from 'elysia';

export const logPLugin = new Elysia({ name: 'logger', seed: 'api' })
  .decorate('logger', createLogger('api', 'request'))
  .derive(() => {
    return {
      startTime: performance.now(),
    };
  })
  .onAfterResponse({ as: 'global' }, ({ request, set, startTime, logger }) => {
    const duration = startTime ? Math.round(performance.now() - startTime) : 0;
    logger.info(
      {
        statusCode: set.status,
        durationMs: duration,
        method: request.method,
        path: new URL(request.url).pathname,
      },
      'Request completed',
    );
  })
  .onError({ as: 'global' }, ({ request, startTime, logger, error, set }) => {
    const duration = startTime ? Math.round(performance.now() - startTime) : 0;

    const errorMessage =
      error instanceof Error ? error.message : error.toString();
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error(
      {
        method: request.method,
        path: new URL(request.url).pathname,
        statusCode: set.status,
        durationMs: duration,
        error: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
      'Request failed',
    );
  });
