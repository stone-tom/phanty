import { randomUUIDv7 } from 'bun';
import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organization, user } from './auth';

export const project = pgTable(
  'project',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUIDv7()),

    name: text('name').notNull(),
    description: text('description'),

    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id),

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
    organizationIdx: index('project_organization_idx').on(table.organizationId),
  }),
);

export const projectRelations = relations(project, ({ one }) => ({
  creator: one(user, {
    fields: [project.createdBy],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [project.organizationId],
    references: [organization.id],
  }),
}));
