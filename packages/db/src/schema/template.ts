import type { BlockEditorDocument, TemplateType } from '@repo/templates';
import { randomUUIDv7 } from 'bun';
import { relations } from 'drizzle-orm';
import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { member, organization } from './auth';

export const template = pgTable(
  'template',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUIDv7()),

    type: text('type').$type<TemplateType>().notNull(),
    name: text('name').notNull(),
    description: text('description'),
    document: jsonb('document').$type<BlockEditorDocument>().notNull(),

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
    organizationIdx: index('template_organization_idx').on(
      table.organizationId,
    ),
    organizationTypeIdx: index('template_org_type_idx').on(
      table.organizationId,
      table.type,
    ),
    organizationArchivedIdx: index('template_org_archived_idx').on(
      table.organizationId,
      table.archivedAt,
    ),
    createdByIdx: index('template_created_by_idx').on(table.createdById),
  }),
);

export const templateRelations = relations(template, ({ one }) => ({
  createdBy: one(member, {
    fields: [template.createdById],
    references: [member.id],
  }),
  organization: one(organization, {
    fields: [template.organizationId],
    references: [organization.id],
  }),
}));
