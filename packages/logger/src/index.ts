import pino from 'pino';
import { env } from './env';

export const logger = pino({
  level: env.LOG_LEVEL || 'info',
  base: null,
  ...(env.LOG_FORMAT === 'pretty' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard' },
    },
  }),
});

export function createLogger(
  app: string,
  name: string,
  bindings?: Record<string, unknown>,
) {
  return logger.child({
    app,
    component: name,
    name: `${app}/${name}`,
    ...bindings,
  });
}
