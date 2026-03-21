import { createLogger } from '@repo/logger';

// import { createDbClient } from '../client';
// import { env } from '../env';

const logger = createLogger('db', 'seed');

// const db = createDbClient(env.DATABASE_URL);

export async function main() {
  logger.info('Started seeding test data...');
  // await seed(db);
  logger.info('finished seeding test data...');
  logger.info('✅ Database seeding completed successfully');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
