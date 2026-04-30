import type { AnyBlock, BlockCategory, BlockVersion } from '@repo/templates';

interface BlockDefinitionLike {
  name: string;
  category: BlockCategory;
  type: string;
  version: BlockVersion;
}

interface CreateBlockFromDefinitionInput {
  definition: BlockDefinitionLike;
  parentId: string;
  sortIndex: number;
  createBlockId?: () => string;
}

export function createBlockFromDefinition(
  input: CreateBlockFromDefinitionInput,
): AnyBlock {
  const {
    definition,
    parentId,
    sortIndex,
    createBlockId = () => crypto.randomUUID(),
  } = input;

  if (definition.category === 'form' && definition.type === 'text') {
    return {
      id: createBlockId(),
      category: 'form',
      type: 'text',
      version: definition.version,
      parentId,
      sortIndex,
      schema: {
        label: 'New Text Block',
      },
    };
  }

  throw new Error(
    `Unsupported block definition: ${definition.category}:${definition.type}@${definition.version}`,
  );
}
