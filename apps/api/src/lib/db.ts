import { createDbClient } from '@repo/db';
import { env } from '../env';
export const db: ReturnType<typeof createDbClient> = createDbClient(
	env.DATABASE_URL,
);
