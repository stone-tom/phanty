import { type ZodObject, type ZodRawShape, z } from 'zod';

function createEnv<T extends ZodRawShape>(
  schema: ZodObject<T>,
  source: Record<string, unknown> = process.env,
) {
  const parsed = schema.safeParse(source);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(z.treeifyError(parsed.error).errors);
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
    BETTER_AUTH_SECRET: z.string().max(32).min(32),
    BETTER_AUTH_URL: z.url(),
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
