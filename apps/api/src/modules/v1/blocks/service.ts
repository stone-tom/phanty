import { blockDefinition, organizationBlockDefinition } from '@repo/db/schema';
import type { BlockCategory } from '@repo/templates';
import { and, asc, eq, getTableColumns } from 'drizzle-orm';
import Elysia from 'elysia';
import { db } from '../../../lib/db';

export class BlockService {
  async findAvailableBlocks(organizationId: string, category?: BlockCategory) {
    const predicates = [
      eq(organizationBlockDefinition.organizationId, organizationId),
      eq(blockDefinition.status, 'active'),
    ];

    if (category) {
      predicates.push(eq(blockDefinition.category, category));
    }

    return db
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
  }
}

export const blockService = new Elysia({
  name: BlockService.name,
}).decorate('blockService', new BlockService());
