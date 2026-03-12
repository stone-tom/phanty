import { type ZodObject, type ZodRawShape, z } from 'zod';

function createEnv<T extends ZodRawShape>(
  schema: ZodObject<T>,
  source: Record<string, unknown> = process.env,
) {
  const parsed = schema.safeParse(source);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(z.treeifyError(parsed.error));
    process.exit(1);
  }

  return parsed.data;
}

export const env = createEnv(
  z.object({
    API_PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string(),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_USERNAME: z.string().optional(),
    BETTER_AUTH_SECRET: z.string(),
    PASSWORD_PEPPER: z.string(),
    BETTER_AUTH_URL: z.url(),
    FRONTEND_URL: z.url(),
    SMTP_HOST: z.string().default('localhost').describe('SMTP server hostname'),
    SMTP_PORT: z.coerce
      .number()
      .int()
      .positive()
      .default(1025)
      .describe('SMTP server port (1025 for Mailpit, 587/465 for production)'),
    SMTP_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((val) => val === 'true')
      .describe('Use TLS (true for port 465, false for 587/1025)'),
    SMTP_USER: z
      .string()
      .optional()
      .describe('SMTP username (optional for local dev)'),
    SMTP_PASS: z
      .string()
      .optional()
      .describe('SMTP password (optional for local dev)'),
    SMTP_FROM_NAME: z
      .string()
      .default('Your App')
      .describe('Default sender name'),
    SMTP_FROM_EMAIL: z
      .email()
      .default('noreply@localhost')
      .describe('Default sender email address'),
    MAINTENANCE_IGNORE_IPS: z
      .string()
      .optional()
      .transform((value) =>
        value
          ?.split(',')
          .map((ip) => ip.trim())
          .filter(Boolean),
      )
      .default([]),
    MAINTENANCE_MODE: z
      .string()
      .optional()
      .transform((value) => value === 'true')
      .default(false),
  }),
);
