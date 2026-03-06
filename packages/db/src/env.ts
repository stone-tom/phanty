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
		DATABASE_URL: z.string(),
		MAX_POOL_SIZE: z.coerce.number().optional().default(20),
		IDLE_TIMEOUT: z.coerce.number().optional().default(30),
		MAX_LIFETIME: z.coerce.number().optional().default(3600),
	}),
);
