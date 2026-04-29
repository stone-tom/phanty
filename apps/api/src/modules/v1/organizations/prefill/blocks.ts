import { blockDefinition, organizationBlockDefinition } from '@repo/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';

export async function grantDefaultBlockAccessToOrganization(
  organizationId: string,
) {
  const activeBlockDefinitions = await db
    .select({ blockDefinitionId: blockDefinition.id })
    .from(blockDefinition)
    .where(eq(blockDefinition.status, 'active'));

  if (activeBlockDefinitions.length === 0) {
    return;
  }

  await db
    .insert(organizationBlockDefinition)
    .values(
      activeBlockDefinitions.map(({ blockDefinitionId }) => ({
        organizationId,
        blockDefinitionId,
      })),
    )
    .onConflictDoNothing({
      target: [
        organizationBlockDefinition.organizationId,
        organizationBlockDefinition.blockDefinitionId,
      ],
    });
}
