import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const test = pgTable('test', {
	id: serial('id').primaryKey(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export type Test = typeof test.$inferSelect;
export type NewTest = typeof test.$inferInsert;
