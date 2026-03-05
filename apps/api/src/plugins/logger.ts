import { createLogger } from '@repo/logger';
import Elysia from 'elysia';
import { env } from '../env';

export const logPLugin = new Elysia({ name: 'logger', seed: 'api' })
  .decorate('logger', createLogger('api', 'request'))
  .derive(() => {
    return {
      startTime: performance.now(),
    };
  })
  .onAfterResponse({ as: 'global' }, ({ request, set, startTime, logger }) => {
    const duration = startTime ? Math.round(performance.now() - startTime) : 0;
    const path = request.url ? new URL(request.url).pathname : 'unknown';
    logger.debug(
      {
        statusCode: set.status,
        durationMs: duration,
        method: request.method,
        path,
      },
      `[${request.method}] ${path} ${set.status} Request completed in ${duration}ms`,
    );
  })
  .onError({ as: 'global' }, ({ request, code, logger, error }) => {
    const errorMessage =
      error instanceof Error ? error.message : error.toString();
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error(
      {
        code,
        method: request.method,
        path: new URL(request.url).pathname,
        error: errorMessage,
        stack: env.NODE_ENV === 'development' ? errorStack : undefined,
      },
      'Request failed',
    );
  });
