import { createDbClient } from '../client';
import { env } from '../env';
import { seedTest } from './test.seed';

const db = createDbClient(env.DATABASE_URL);

export async function main() {
  await seedTest(db);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
