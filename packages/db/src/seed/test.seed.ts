import type { Database } from '../client';
import { test } from '../schema';

export async function seedTest(db: Database) {
	return db
		.insert(test)
		.values([{ email: 'admin@phanty.app', createdAt: new Date() }])
		.onConflictDoNothing()
		.returning();
}
