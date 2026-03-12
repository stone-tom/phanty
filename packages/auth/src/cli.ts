import { createDbClient } from '@repo/db/client';
import { env } from './env';
import { initAuthServerClient } from './server';

// This file is used for the auth cli so we can generate the database schema
const auth = initAuthServerClient({
  db: createDbClient(env.DATABASE_URL),
  // biome-ignore lint/suspicious/noExplicitAny: otherwise we need to specify every other field which is not relevant for cli
} as any);

export default auth;
