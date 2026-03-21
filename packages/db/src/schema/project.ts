import { randomUUIDv7 } from 'bun';
import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { member, organization } from './auth';

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

    createdById: text('created_by')
      .notNull()
      .references(() => member.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    createdByIdx: index('project_created_by_idx').on(table.createdById),
    organizationIdx: index('project_organization_idx').on(table.organizationId),
  }),
);

export const projectRelations = relations(project, ({ one }) => ({
  createdBy: one(member, {
    fields: [project.createdById],
    references: [member.id],
  }),
  organization: one(organization, {
    fields: [project.organizationId],
    references: [organization.id],
  }),
}));
