import { blockDefinition, organizationBlockDefinition } from '@repo/db/schema';
import {
  type AnyBlock,
  type BlockCategory,
  type BlockEditorDocument,
  type BlockType,
  type BlockVersion,
  getBlockVersionKey,
} from '@repo/templates';
import { and, eq, or } from 'drizzle-orm';
import { db } from '../../../lib/db';

type DocumentBlockDefinition = Pick<
  AnyBlock,
  'category' | 'type' | 'version'
> & {
  key: string;
};

export async function validateOrganizationBlockAccess(
  organizationId: string,
  document: BlockEditorDocument,
) {
  const requestedDefinitions = getDocumentBlockDefinitions(document);

  if (requestedDefinitions.length === 0) {
    return [];
  }

  const definitionPredicates = requestedDefinitions.map((definition) =>
    and(
      eq(blockDefinition.category, definition.category),
      eq(blockDefinition.type, definition.type),
      eq(blockDefinition.version, definition.version),
    ),
  );

  const existingDefinitions = await db
    .select({
      category: blockDefinition.category,
      type: blockDefinition.type,
      version: blockDefinition.version,
    })
    .from(blockDefinition)
    .where(or(...definitionPredicates));

  const accessibleDefinitions = await db
    .select({
      category: blockDefinition.category,
      type: blockDefinition.type,
      version: blockDefinition.version,
    })
    .from(blockDefinition)
    .innerJoin(
      organizationBlockDefinition,
      eq(organizationBlockDefinition.blockDefinitionId, blockDefinition.id),
    )
    .where(
      and(
        eq(organizationBlockDefinition.organizationId, organizationId),
        or(...definitionPredicates),
      ),
    );

  const existingDefinitionKeys = new Set<string>(
    existingDefinitions.map(getDefinitionKey),
  );
  const accessibleDefinitionKeys = new Set<string>(
    accessibleDefinitions.map(getDefinitionKey),
  );
  const errors: string[] = [];

  for (const definition of requestedDefinitions) {
    if (!existingDefinitionKeys.has(definition.key)) {
      errors.push(`Unknown block definition "${definition.key}".`);
      continue;
    }

    if (!accessibleDefinitionKeys.has(definition.key)) {
      errors.push(
        `Organization does not have access to block definition "${definition.key}".`,
      );
    }
  }

  return errors;
}

function getDocumentBlockDefinitions(document: BlockEditorDocument) {
  const definitionsByKey = new Map<string, DocumentBlockDefinition>();

  for (const block of Object.values(document.blocks)) {
    const key = getDefinitionKey(block);

    if (definitionsByKey.has(key)) {
      continue;
    }

    definitionsByKey.set(key, {
      category: block.category,
      type: block.type,
      version: block.version,
      key,
    });
  }

  return Array.from(definitionsByKey.values());
}

function getDefinitionKey(definition: {
  category: BlockCategory;
  type: BlockType;
  version: BlockVersion;
}) {
  return getBlockVersionKey(
    definition.category,
    definition.type,
    definition.version,
  );
}
