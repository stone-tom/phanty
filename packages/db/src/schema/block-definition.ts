import type {
  BlockCategory,
  BlockDefinitionStatus,
  BlockType,
  BlockVersion,
} from '@repo/templates';
import { randomUUIDv7 } from 'bun';
import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

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
