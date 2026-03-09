import { createDbClient, type Database } from '@repo/db/client';
import { env } from '../env';

export const db: Database = createDbClient(env.DATABASE_URL);
