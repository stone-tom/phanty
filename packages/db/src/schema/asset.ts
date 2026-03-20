import { randomUUIDv7 } from 'bun';
import { relations, sql } from 'drizzle-orm';
import {
  bigint,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

export const asset = pgTable(
  'asset',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUIDv7()),

    filename: text('filename').notNull(),
    originalFilename: text('original_filename'),

    directory: text('directory').notNull().default(''),
    storageKey: text('storage_key').notNull(),

    contentType: text('content_type').notNull(),
    extension: text('extension'),

    sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
    checksum: text('checksum'),

    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    createdByIdx: index('assets_created_by_idx').on(table.createdBy),
  }),
);

export const assetsRelations = relations(asset, ({ one }) => ({
  creator: one(user, {
    fields: [asset.createdBy],
    references: [user.id],
  }),
}));
