import { sql } from 'drizzle-orm';
import { Elysia } from 'elysia';
import { db } from '../lib/db';
import { redisClient } from '../lib/redis';
import { withTimeout } from '../util/with-timeout';

const checkDb = async () => {
  try {
    await withTimeout(db.execute(sql`SELECT 1`));
    return { status: 'up' } as const;
  } catch {
    return { status: 'down' } as const;
  }
};

const checkRedis = async () => {
  try {
    await withTimeout(redisClient.ping());
    return { status: 'up' } as const;
  } catch {
    return { status: 'down' } as const;
  }
};

export const healhcheck = new Elysia({ name: 'healhcheck' })
  .get('/health', async ({ set }) => {
    const [database, cache] = await Promise.all([checkDb(), checkRedis()]);

    const isHealthy = database.status === 'up' && cache.status === 'up';

    if (!isHealthy) set.status = 503;

    return {
      status: isHealthy ? 'ok' : 'degraded',
      uptime: Math.floor(process.uptime()),
    };
  })
  .listen(3000);
