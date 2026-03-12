import { type ZodObject, type ZodRawShape, z } from 'zod';

function createEnv<T extends ZodRawShape>(
  schema: ZodObject<T>,
  source: Record<string, unknown> = import.meta.env,
) {
  const parsed = schema.safeParse(source);

  if (!parsed.success) {
    console.error(
      '❌ Invalid environment variables:',
      z.treeifyError(parsed.error),
    );
    throw new Error(
      `Invalid environment variables: ${Object.keys(z.treeifyError(parsed.error)).join(', ')}`,
    );
  }

  return parsed.data;
}

export const env = createEnv(
  z.object({
    VITE_API_URL: z.url(),
    VITE_BASE_URL: z.url(),
  }),
);
