import { cors } from '@elysiajs/cors';
import openapi from '@elysiajs/openapi';
import { Elysia } from 'elysia';

import { env } from './env';
import { auth, OpenAPI } from './lib/auth';
import { v1 } from './modules/v1';
import { healthcheck } from './plugins/healthcheck';
import { maintenance } from './plugins/maintenance';

const app = new Elysia()
	.use(
		cors({
			origin: env.CORS_ORIGINS,
			credentials: true,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization'],
		}),
	)
	.use(maintenance)
	.use(
		openapi({
			documentation: {
				components: await OpenAPI.components,
				paths: await OpenAPI.getPaths(),
			},
		}),
	)
	.mount('/auth', auth.handler)
	.use(healthcheck)
	.use(v1)
	.listen(env.API_PORT);

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
