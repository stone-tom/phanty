import { type ZodObject, type ZodRawShape, z } from 'zod';

function createEnv<T extends ZodRawShape>(
  schema: ZodObject<T>,
  source: Record<string, unknown> = process.env,
) {
  const parsed = schema.safeParse(source);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = createEnv(
  z.object({
    API_PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string(),
  }),
);
