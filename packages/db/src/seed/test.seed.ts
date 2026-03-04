import type { Database } from '../client';
import { test } from '../schema';

export async function seedTest(db: Database) {
  return db
    .insert(test)
    .values([{ email: 'test@bitminds.at', createdAt: new Date() }])
    .onConflictDoNothing()
    .returning();
}
