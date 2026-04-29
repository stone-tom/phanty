import type {
  BlockCategory,
  BlockDefinitionStatus,
  BlockType,
  BlockVersion,
} from '@repo/templates';
import { randomUUIDv7 } from 'bun';
import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { organization } from './auth';

export const blockDefinition = pgTable(
  'block_definition',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUIDv7()),

    name: text('name').notNull(),
    description: text('description').notNull(),
    category: text('category').$type<BlockCategory>().notNull(),
    type: text('type').$type<BlockType>().notNull(),
    version: integer('version').$type<BlockVersion>().notNull(),
    status: text('status').$type<BlockDefinitionStatus>().notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    blockDefinitionVersionUidx: uniqueIndex('block_definition_version_uidx').on(
      table.category,
      table.type,
      table.version,
    ),
  }),
);

export const organizationBlockDefinition = pgTable(
  'organization_block_definition',
  {
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    blockDefinitionId: text('block_definition_id')
      .notNull()
      .references(() => blockDefinition.id, { onDelete: 'cascade' }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    organizationBlockDefinitionUidx: uniqueIndex(
      'organization_block_definition_uidx',
    ).on(table.organizationId, table.blockDefinitionId),
  }),
);

export const blockDefinitionRelations = relations(
  blockDefinition,
  ({ many }) => ({
    organizationAccess: many(organizationBlockDefinition),
  }),
);

export const organizationBlockDefinitionRelations = relations(
  organizationBlockDefinition,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationBlockDefinition.organizationId],
      references: [organization.id],
    }),
    blockDefinition: one(blockDefinition, {
      fields: [organizationBlockDefinition.blockDefinitionId],
      references: [blockDefinition.id],
    }),
  }),
);
