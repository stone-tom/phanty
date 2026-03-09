import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from './env';
import * as schema from './schema';

// NOTICE:
// ONLY USE THIS CLIENT IF ABSOLUTELY NECESSARY
export function createNodeDbClient(databaseUrl: string) {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: env.MAX_POOL_SIZE,
    idleTimeoutMillis: env.IDLE_TIMEOUT,
    connectionTimeoutMillis: 5000,
  });

  return drizzle(pool, { schema });
}

export type NodeDatabase = ReturnType<typeof createNodeDbClient>;
