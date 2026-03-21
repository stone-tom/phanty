import Elysia from 'elysia';
import { env } from '../env';

export const errorPlugin = new Elysia({ name: 'error' }).onError(
  { as: 'global' },
  ({ request, code, status, set, error }) => {
    const errorMessage =
      error instanceof Error ? error.message : error.toString();
    const errorStack = error instanceof Error ? error.stack : undefined;

    return status(set.status || 500, {
      code,
      method: request.method,
      path: new URL(request.url).pathname,
      error: errorMessage,
      stack: env.NODE_ENV === 'development' ? errorStack : undefined,
    });
  },
);
