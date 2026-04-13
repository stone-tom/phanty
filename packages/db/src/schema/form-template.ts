import { randomUUIDv7 } from 'bun';
import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { member, organization } from './auth';

export const formTemplate = pgTable(
  'form_template',
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

    archivedAt: timestamp('archived_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    createdByIdx: index('form_template_created_by_idx').on(table.createdById),
    organizationIdx: index('form_template_organization_idx').on(
      table.organizationId,
    ),
    archivedAtIdx: index('form_template_archived_at_idx').on(table.archivedAt),
    organizationArchivedIdx: index('form_template_org_archived_idx').on(
      table.organizationId,
      table.archivedAt,
    ),
  }),
);

export const formTemplateRelations = relations(formTemplate, ({ one }) => ({
  createdBy: one(member, {
    fields: [formTemplate.createdById],
    references: [member.id],
  }),
  organization: one(organization, {
    fields: [formTemplate.organizationId],
    references: [organization.id],
  }),
}));
