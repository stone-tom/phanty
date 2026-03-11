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
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    WORKER_QUEUES: z.string().default('all'),
    WORKER_DEFAULT_CONCURRENCY: z.coerce.number().default(3),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_USERNAME: z.string().optional(),
  }),
);
