import { resolve } from 'node:path';
import { inspect } from 'bun';
import pino, { type LogDescriptor } from 'pino';
import pretty from 'pino-pretty';
import { env } from './env';

const bold = (str: string) => `\x1b[1m${str}\x1b[0m`;

const formatLocation = (path: string): string => {
  const projectRoot = resolve(__dirname, '../../../');
  let clean = path.replace(/^file:\/\//, '').replace(/\\/g, '/');

  const rootNormalized = projectRoot.replace(/\\/g, '/');
  if (clean.startsWith(`${rootNormalized}/`)) {
    clean = `./${clean.slice(rootNormalized.length + 1)}`;
  }
  clean = clean.replace(/\/\.pnpm\/[^/]+/g, '/...');
  return `\n${clean.padStart(clean.length + 10)}`;
};

const formatStackLine = (line: string) => {
  const match = line.match(/at\s+(.+?)\s+\((.+)\)/);
  if (!match) return line;

  const [, func, loc] = match;
  return `${bold('at')} ${func || ''} ${loc ? formatLocation(loc) : ''}`;
};

const pinoPretty = pretty({
  colorize: true,
  translateTime: 'SYS:standard',
  hideObject: true,
  messageFormat: (
    log: LogDescriptor,
    messageKey: string,
    _: string,
    { colors },
  ) => {
    const msg = String(log[messageKey] ?? '');
    const isError = (log.level as number) >= 50;

    const standardKeys = new Set([
      messageKey,
      'time',
      'level',
      'pid',
      'hostname',
      'v',
      'app',
      'component',
      'name',
    ]);
    const extras: Record<string, unknown> = {};

    if (isError) standardKeys.add('error');

    for (const [key, value] of Object.entries(log)) {
      if (!standardKeys.has(key)) extras[key] = value;
    }

    const hasExtras = Object.keys(extras).length > 0;

    if (!isError) {
      if (!env.LOGGING_HIDE_OBJECT && hasExtras) {
        return `${msg} ${colors.gray(inspect(extras, { compact: true, depth: 2, colors: false }))}`;
      }
      return msg;
    }

    if (!hasExtras) return msg;

    const lines: string[] = [msg];

    for (const [key, value] of Object.entries(extras)) {
      if (key === 'stack' && typeof value === 'string') {
        lines.push(`${colors.yellow(key.padStart(key.length + 4, ' '))}:`);

        const stackLines = value.split('\n');
        stackLines.forEach((line, idx) => {
          if (idx === 0) {
            lines.push(`${colors.red(line.padStart(line.length + 6, ' '))}`);
          } else {
            const formattedLine = formatStackLine(line);
            lines.push(
              `${colors.gray(formattedLine.padStart(formattedLine.length + 8, ' '))}`,
            );
          }
        });
      } else {
        const formatted =
          typeof value === 'object' && value !== null
            ? inspect(value, { depth: 3, colors: false })
            : String(value);
        const line = `${colors.cyan(key)}: ${colors.white(formatted)}`;
        lines.push(line.padStart(line.length + 4, ' '));
      }
    }

    return lines.join('\n');
  },
});

const baseConfig = {
  level: env.LOGGING_LOG_LEVEL || 'info',
  base: null,
};

const isPretty = env.LOGGING_LOG_FORMAT === 'pretty';

export const logger = isPretty
  ? pino(baseConfig, pinoPretty)
  : pino(baseConfig);

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
