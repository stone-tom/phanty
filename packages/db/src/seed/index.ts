import { createDbClient } from '../client';
import { env } from '../env';
import { seedTest } from './test.seed';

const db = createDbClient(env.DATABASE_URL);

export async function main() {
	console.info('Started seeding test data...');
	await seedTest(db);
	console.info('finished seeding test data...');
	console.info('✅ Database seeding completed successfully');
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
