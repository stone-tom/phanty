import { type ZodObject, type ZodRawShape, z } from 'zod';

function createEnv<T extends ZodRawShape>(
	schema: ZodObject<T>,
	source: Record<string, unknown> = import.meta.env,
) {
	const parsed = schema.safeParse(source);

	if (!parsed.success) {
		console.error('Invalid environment variables:');
		console.error(z.treeifyError(parsed.error).errors);
		throw new Error('Invalid environment variables');
	}

	return parsed.data;
}

export const env = createEnv(
	z.object({
		BACKEND_URL: z.url(),
	}),
	{
		BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
	},
);
