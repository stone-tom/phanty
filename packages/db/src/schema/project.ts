import { randomUUIDv7 } from 'bun';
import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const project = pgTable(
  'project',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUIDv7()),

    name: text('name').notNull(),
    description: text('description'),

    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    createdByIdx: index('project_created_by_idx').on(table.createdBy),
  }),
);

export const projectRelations = relations(project, ({ one }) => ({
  creator: one(user, {
    fields: [project.createdBy],
    references: [user.id],
  }),
}));
