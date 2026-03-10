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
		CORS_ORIGINS: z
			.string()
			.optional()
			.transform((value) =>
				value
					?.split(',')
					.map((origin) => origin.trim())
					.filter(Boolean),
			)
			.default(['http://localhost:5173']),
		NODE_ENV: z
			.enum(['development', 'production', 'test'])
			.default('development'),
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
		BETTER_AUTH_SECRET: z.string(),
		BETTER_AUTH_URL: z.string(),
		SEED_AUTH_NAME: z.string().default('Admin'),
		SEED_AUTH_EMAIL: z.email().default('admin@phanty.app'),
		SEED_AUTH_PASSWORD: z.string().default('change-me-please'),
	}),
);
