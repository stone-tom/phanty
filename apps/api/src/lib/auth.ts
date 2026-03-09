import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import { db } from './db';

export const auth = betterAuth({
	basePath: '/api',
	plugins: [openAPI()],
	database: drizzleAdapter(db, {
		provider: 'pg',
	}),
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
	},
});

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());

export const OpenAPI = {
	getPaths: (prefix = '/auth/api') =>
		getSchema().then(({ paths }) => {
			const reference: typeof paths = Object.create(null);

			for (const path of Object.keys(paths)) {
				const pathItem = paths[path];
				if (!pathItem) continue;

				const key = prefix + path;
				reference[key] = pathItem;

				for (const method of Object.keys(pathItem)) {
					// biome-ignore lint: suspicious/noExplicitAny
					const operation = (reference[key] as any)[method];

					operation.tags = ['Better Auth'];
				}
			}

			return reference;
			// biome-ignore lint: suspicious/noExplicitAny
		}) as Promise<any>,
	// biome-ignore lint: suspicious/noExplicitAny
	components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;
