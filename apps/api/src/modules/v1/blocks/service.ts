import { blockDefinition, organizationBlockDefinition } from '@repo/db/schema';
import {
  type BlockCategory,
  type BlockDefinition,
  BlockDefinitionSchema,
} from '@repo/templates';
import { and, asc, eq, getTableColumns } from 'drizzle-orm';
import Elysia from 'elysia';
import { db } from '../../../lib/db';

type BlockDefinitionRow = typeof blockDefinition.$inferSelect;
type AvailableBlockDefinition = BlockDefinition &
  Pick<BlockDefinitionRow, 'id' | 'createdAt' | 'updatedAt'>;

export class BlockService {
  async findAvailableBlocks(organizationId: string, category?: BlockCategory) {
    const predicates = [
      eq(organizationBlockDefinition.organizationId, organizationId),
      eq(blockDefinition.status, 'active'),
    ];

    if (category) {
      predicates.push(eq(blockDefinition.category, category));
    }

    const rows = await db
      .select(getTableColumns(blockDefinition))
      .from(blockDefinition)
      .innerJoin(
        organizationBlockDefinition,
        eq(organizationBlockDefinition.blockDefinitionId, blockDefinition.id),
      )
      .where(and(...predicates))
      .orderBy(
        asc(blockDefinition.category),
        asc(blockDefinition.type),
        asc(blockDefinition.version),
      );

    return rows.map(toAvailableBlockDefinition);
  }
}

function toAvailableBlockDefinition(
  row: BlockDefinitionRow,
): AvailableBlockDefinition {
  const { id, createdAt, updatedAt, ...definition } = row;
  const parsedDefinition = BlockDefinitionSchema.parse(definition);

  return {
    ...parsedDefinition,
    id,
    createdAt,
    updatedAt,
  };
}

export const blockService = new Elysia({
  name: BlockService.name,
}).decorate('blockService', new BlockService());
