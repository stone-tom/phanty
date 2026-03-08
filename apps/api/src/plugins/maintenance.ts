import Elysia from 'elysia';
import { env } from '../env';
import { getClientIp } from '../util/get-client-ip';

export const maintenance = new Elysia({ name: 'maintenance' }).onBeforeHandle(
	{ as: 'global' },
	async ({ set, request, server }) => {
		const url = new URL(request.url);
		const ignoreRoutes = ['/health'];
		if (ignoreRoutes.includes(url.pathname)) return;

		if (env.MAINTENANCE_MODE) {
			const allowedIps = env.MAINTENANCE_IGNORE_IPS;

			const clientIp =
				getClientIp(request) || server?.requestIP(request)?.address;

			if (clientIp && allowedIps.includes(clientIp)) return;

			set.status = 503;
			set.headers['Retry-After'] = '3600';
			return {
				status: 503,
				message: 'Under maintenance.',
			};
		}
		return;
	},
);
