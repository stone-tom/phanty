import { createNodeDbClient, type NodeDatabase } from '@repo/db/client.node';
import { env } from '../env';

export const db: NodeDatabase = createNodeDbClient(env.DATABASE_URL);
