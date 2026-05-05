import type { AnyBlock, BlockCategory, BlockVersion } from '@repo/templates';

interface BlockDefinitionLike {
  name: string;
  category: BlockCategory;
  type: string;
  version: BlockVersion;
}

interface CreateBlockFromDefinitionInput {
  definition: BlockDefinitionLike;
  parentId: string | null;
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

  if (definition.category === 'layout') {
    if (definition.type === 'container') {
      return {
        id: createBlockId(),
        category: 'layout',
        type: 'container',
        version: definition.version,
        parentId: null,
        sortIndex,
      };
    }
  }

  if (definition.category === 'form') {
    if (parentId === null) {
      throw new Error('Form blocks require a parent layout block.');
    }

    if (definition.type === 'text') {
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
  }

  throw new Error(
    `Unsupported block definition: ${definition.category}:${definition.type}@${definition.version}`,
  );
}
