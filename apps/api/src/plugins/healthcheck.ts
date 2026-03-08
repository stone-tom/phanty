import { sql } from 'drizzle-orm';
import { Elysia } from 'elysia';
import { db } from '../lib/db';
import { withTimeout } from '../util/with-timeout';

const checkDb = async () => {
	try {
		await withTimeout(db.execute(sql`SELECT 1`));
		return { status: 'up' } as const;
	} catch {
		return { status: 'down' } as const;
	}
};

export const healthcheck = new Elysia({ name: 'healthcheck' })
	.get('/health', async ({ set }) => {
		const [database] = await Promise.all([checkDb()]);

		const isHealthy = database.status === 'up';

		if (!isHealthy) set.status = 503;

		return {
			status: isHealthy ? 'ok' : 'degraded',
			uptime: Math.floor(process.uptime()),
		};
	})
	.listen(3000);
