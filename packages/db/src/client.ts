import { drizzle } from "drizzle-orm/bun-sql";
import { SQL } from "bun";
import * as schema from './schema';
import { env } from './env';

export function createDbClient(databaseUrl: string) {
  const client = new SQL(databaseUrl, {
    max: env.MAX_POOL_SIZE,
    idleTimeout: env.IDLE_TIMEOUT,
    maxLifetime: env.MAX_POOL_SIZE,
  });


  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDbClient>;
