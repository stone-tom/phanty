import type {
  BlockEditorDocument,
  FormBlock,
  ParentBlock,
} from '@/components/block-editor/types';

const CONTAINER_COUNT = 10;
const FIELDS_PER_CONTAINER = 20;

const root = Array.from({ length: CONTAINER_COUNT }, (_, containerIndex) => {
  const containerNumber = containerIndex + 1;

  return {
    id: `container-${containerNumber}`,
    category: 'layout',
    type: 'container',
    parentId: null,
    sortIndex: containerIndex,
  } satisfies ParentBlock;
});

const blocks = root.reduce<BlockEditorDocument['blocks']>(
  (accumulator, container) => {
    accumulator[container.id] = Array.from(
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
            name: `${container.id}Text${fieldNumber}`,
            label: `Text ${fieldNumber}`,
          },
        } satisfies FormBlock;
      },
    );

    return accumulator;
  },
  { root },
);

export const largeEditorDocument = {
  version: 1,
  templateType: 'form',
  blocks,
  settings: {},
} satisfies BlockEditorDocument;
