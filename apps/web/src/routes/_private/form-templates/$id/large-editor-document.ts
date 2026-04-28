import type {
  BlockEditorDocument,
  FormBlock,
  RootBlock,
} from '@/components/block-editor/types';

const CONTAINER_COUNT = 10;
const FIELDS_PER_CONTAINER = 10;

const containers = Array.from(
  { length: CONTAINER_COUNT },
  (_, containerIndex) => {
    const containerNumber = containerIndex + 1;

    return {
      id: `container-${containerNumber}`,
      category: 'layout',
      type: 'container',
      parentId: null,
      sortIndex: containerIndex + 1,
    } satisfies RootBlock;
  },
);

const blocks = containers.reduce<BlockEditorDocument['blocks']>(
  (accumulator, container) => {
    accumulator[container.id] = container;

    for (const field of Array.from(
      { length: FIELDS_PER_CONTAINER },
      (_, fieldIndex) => {
        const fieldNumber = fieldIndex + 1;

        return {
          id: `${container.id}-text-${fieldNumber}`,
          category: 'form',
          type: 'text',
          parentId: container.id,
          sortIndex: fieldIndex,
          schema: {
            label: `Text ${fieldNumber}`,
          },
        } satisfies FormBlock;
      },
    )) {
      accumulator[field.id] = field;
    }

    return accumulator;
  },
  {},
);

export const largeEditorDocument = {
  version: 1,
  templateType: 'form',
  blocks,
  settings: {},
} satisfies BlockEditorDocument;
