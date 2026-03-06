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
    LOGGING_LOG_LEVEL: z.string().optional().default('info'),
    LOGGING_LOG_FORMAT: z.string().optional().default('pretty'),
    LOGGING_HIDE_OBJECT: z
      .string()
      .optional()
      .transform((value) => value === 'true')
      .default(false),
  }),
);
