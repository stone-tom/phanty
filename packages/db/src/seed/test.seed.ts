import type { Database } from '../client';
import { test } from '../schema';

export async function seedTest(db: Database) {
	return db
		.insert(test)
		.values([
			{ email: 'admin@phanty.app', createdAt: new Date() },
			{ email: 'user@phanty.app', createdAt: new Date() },
			{ email: 'another-user@phanty.app', createdAt: new Date() },
		])
		.onConflictDoNothing()
		.returning();
}
