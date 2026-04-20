import { arrayMove } from '@dnd-kit/helpers';
import { mergeWith } from 'lodash';
import { createContext, useContext, useState } from 'react';
import type { PartialDeep, SimplifyDeep } from 'type-fest';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';
import {
  type AnyBlock,
  type BlockEditorDocument,
  type BlockType,
  isLeafBlock,
  isParentBlock,
} from './types';
import { buildIndex } from './utils';

export interface BlockIndex {
  byId: Map<string, AnyBlock>;
  listKeyById: Map<string, string>; // "root" or parent blockId
  childIdsById: Map<string, string[]>; // for quick child access
}

type GetBlock<TType extends BlockType> = Extract<AnyBlock, { type: TType }>;

type StructuralBlockKey = 'id' | 'type' | 'category' | 'parentId';

type GetBlockChanges<TType extends BlockType> = SimplifyDeep<
  PartialDeep<Omit<GetBlock<TType>, StructuralBlockKey>>
>;

export type AssertedBlock<TParams> = TParams extends {
  assertType: infer TType extends BlockType;
}
  ? GetBlock<TType>
  : AnyBlock;

export interface BlockEditorStoreState {
  document: BlockEditorDocument;
  selectedBlock: AnyBlock['id'] | null;
  index: BlockIndex;

  actions: {
    replaceBlocks: (blocks: BlockEditorDocument['blocks']) => void;
    replaceDocument: (document: BlockEditorDocument) => void;
    addBlock: (input: {
      block: AnyBlock;
      parentId: string | null;
      index: number;
      select?: boolean;
    }) => void;
    deleteBlock: (id: string) => void;
    updateBlock: <TType extends BlockType>(
      id: string,
      changes: GetBlockChanges<TType>,
    ) => void;
    moveBlock: (input: {
      id: string;
      toParentId: string | null;
      toIndex: number;
    }) => void;
    reorderBlock: (input: { id: string; newIndex: number }) => void;
    selectBlock: (blockId: string | null) => void;
  };
}

type StateInitializer = (
  initialDocument: BlockEditorDocument,
) => StateCreator<BlockEditorStoreState>;

const createBlockEditorState: StateInitializer =
  (initialDocument) => (set) => ({
    document: initialDocument,
    selectedBlock: null,
    index: buildIndex(initialDocument.blocks),

    actions: {
      replaceBlocks: (blocks) => {
        set((state) => {
          if (!isValidBlockPlacement(blocks)) {
            return state;
          }

          const normalizedBlocks = normalizeBlockParents(blocks);

          return {
            document: { ...state.document, blocks: normalizedBlocks },
            index: buildIndex(normalizedBlocks),
          };
        });
      },

      replaceDocument: (document) => {
        if (!isValidBlockPlacement(document.blocks)) {
          throw new Error('Invalid block editor document');
        }

        const normalizedBlocks = normalizeBlockParents(document.blocks);

        set({
          document: { ...document, blocks: normalizedBlocks },
          index: buildIndex(normalizedBlocks),
        });
      },

      addBlock: (input) => {
        const { block, parentId, index, select = false } = input;
        const listKey = parentId ?? 'root';

        set((state) => {
          let blockToInsert: AnyBlock;
          if (parentId === null && isParentBlock(block)) {
            blockToInsert = { ...block, parentId: null };
          } else if (parentId !== null && isLeafBlock(block)) {
            blockToInsert = { ...block, parentId };
          } else {
            throw new Error(`Invalid block placement`);
          }

          const currentList = state.document.blocks[listKey] ?? [];
          const newList = [...currentList];
          newList.splice(index, 0, blockToInsert);

          const newBlocks = {
            ...state.document.blocks,
            [listKey]: newList,
          };

          return {
            document: { ...state.document, blocks: newBlocks },
            index: buildIndex(newBlocks),
            selectedBlock: select ? blockToInsert.id : state.selectedBlock,
          };
        });
      },

      deleteBlock: (id) => {
        set((state) => {
          const listKey = state.index.listKeyById.get(id);
          if (listKey === undefined) {
            console.error(`Block "${id}" not found`);
            return state;
          }

          const list = state.document.blocks[listKey];
          const newList = list.filter((b) => b.id !== id);

          const newBlocks = { ...state.document.blocks };
          newBlocks[listKey] = newList;

          // Also delete this block's children list if exists
          delete newBlocks[id];

          // Recursively delete children
          const children = state.index.childIdsById.get(id) ?? [];
          for (const childId of children) {
            delete newBlocks[childId];
          }

          return {
            document: { ...state.document, blocks: newBlocks },
            index: buildIndex(newBlocks),
            selectedBlock:
              state.selectedBlock === id ? null : state.selectedBlock,
          };
        });
      },

      updateBlock: (id, changes) => {
        set((state) => {
          const listKey = state.index.listKeyById.get(id);
          if (listKey === undefined) {
            console.error(`Block "${id}" not found`);
            return state;
          }

          const list = state.document.blocks[listKey];
          const newList = list.map((b) =>
            b.id === id
              ? mergeWith({}, b, changes, (_: unknown, src: unknown) =>
                  Array.isArray(src) ? src : undefined,
                )
              : b,
          );

          const newBlocks = { ...state.document.blocks, [listKey]: newList };

          return {
            document: { ...state.document, blocks: newBlocks },
            index: buildIndex(newBlocks),
          };
        });
      },

      // Same container reorder — for dnd-kit sort
      reorderBlock: ({ id, newIndex }) => {
        set((state) => {
          const listKey = state.index.listKeyById.get(id);
          if (listKey === undefined) return state;

          const list = state.document.blocks[listKey];
          const oldIndex = list.findIndex((b) => b.id === id);
          if (oldIndex === -1) return state;

          const newList = arrayMove(list, oldIndex, newIndex);
          const newBlocks = { ...state.document.blocks, [listKey]: newList };

          return {
            document: { ...state.document, blocks: newBlocks },
            index: buildIndex(newBlocks),
          };
        });
      },

      // Cross-container move — for dnd-kit between containers
      moveBlock: ({ id, toParentId, toIndex }) => {
        set((state) => {
          const fromListKey = state.index.listKeyById.get(id);
          if (fromListKey === undefined) {
            console.error(`Block "${id}" not found`);
            return state;
          }

          const toListKey = toParentId ?? 'root';
          const block = state.index.byId.get(id);

          if (!block) {
            console.error(`Block "${id}" not found in index`);
            return state;
          }

          // Parent blocks (layout) can only be at root
          if (toParentId === null && !isParentBlock(block)) {
            throw new Error(`Only parent blocks can be at root level`);
          }

          // Leaf blocks (form) must have a parent
          if (toParentId !== null && !isLeafBlock(block)) {
            throw new Error(`Leaf blocks must have a parent`);
          }

          const fromList = state.document.blocks[fromListKey].filter(
            (b) => b.id !== id,
          );

          const toList = [...(state.document.blocks[toListKey] ?? [])];

          if (toParentId === null && isParentBlock(block)) {
            toList.splice(toIndex, 0, { ...block, parentId: null });
          } else if (toParentId !== null && isLeafBlock(block)) {
            toList.splice(toIndex, 0, { ...block, parentId: toParentId });
          } else {
            throw new Error(`Invalid block move`);
          }

          const newBlocks = {
            ...state.document.blocks,
            [fromListKey]: fromList,
            [toListKey]: toList,
          };

          return {
            document: { ...state.document, blocks: newBlocks },
            index: buildIndex(newBlocks),
          };
        });
      },
      selectBlock: (blockId) => {
        set({ selectedBlock: blockId });
      },
    },
  });

function normalizeBlockParents(
  blocks: BlockEditorDocument['blocks'],
): BlockEditorDocument['blocks'] {
  const normalizedBlocks: BlockEditorDocument['blocks'] = {
    ...blocks,
    root: [],
  };

  for (const [listKey, list] of Object.entries(blocks)) {
    let didChangeList = false;

    const normalizedList = list.map((block) => {
      if (
        listKey !== 'root' &&
        isLeafBlock(block) &&
        block.parentId !== listKey
      ) {
        didChangeList = true;
        return { ...block, parentId: listKey };
      }

      return block;
    });

    normalizedBlocks[listKey] = didChangeList ? normalizedList : list;
  }

  return normalizedBlocks;
}

function isValidBlockPlacement(blocks: BlockEditorDocument['blocks']): boolean {
  const rootBlocks = blocks.root;
  const rootBlockIds = new Set(rootBlocks.map((block) => block.id));

  for (const block of rootBlocks) {
    if (!isParentBlock(block)) {
      return false;
    }
  }

  for (const [listKey, list] of Object.entries(blocks)) {
    if (listKey === 'root') {
      continue;
    }

    if (!rootBlockIds.has(listKey)) {
      return false;
    }

    for (const block of list) {
      if (!isLeafBlock(block)) {
        return false;
      }
    }
  }

  return true;
}

export const useCreateBlockEditorStore = (
  initialDocument: BlockEditorDocument,
): StoreApi<BlockEditorStoreState> => {
  const [store] = useState(() =>
    createStore(createBlockEditorState(initialDocument)),
  );
  return store;
};

export const BlockEditorStoreContext = createContext<
  StoreApi<BlockEditorStoreState> | undefined
>(undefined);

export const useBlockEditorStore = (): StoreApi<BlockEditorStoreState> => {
  const store = useContext(BlockEditorStoreContext);

  if (!store) {
    throw new Error(
      'useBlockEditorStore must be used within BlockEditorStoreContext',
    );
  }

  return store;
};
