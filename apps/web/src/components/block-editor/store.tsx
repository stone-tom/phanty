import type { AnyBlock, BlockEditorDocument, BlockType } from '@repo/templates';
import { createContext, useContext, useState } from 'react';
import type { PartialDeep, SimplifyDeep } from 'type-fest';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';
import {
  buildChildBlockOrder,
  buildRootBlockOrder,
  type GroupedChildBlockIds,
  getBlockAndDescendantIds,
  insertBlockIntoOrder,
  normalizeSiblingSortIndexes,
} from './ordering';

type GetBlock<TType extends BlockType> = Extract<AnyBlock, { type: TType }>;

type StructuralBlockKey =
  | 'id'
  | 'type'
  | 'category'
  | 'version'
  | 'parentId'
  | 'sortIndex';

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
  selectedBlockId: AnyBlock['id'] | null;

  actions: {
    reorderRootBlocks: (rootIds: AnyBlock['id'][]) => void;
    reorderChildBlocks: (groupedChildIdsByParent: GroupedChildBlockIds) => void;
    updateBlock: <TType extends BlockType>(
      id: string,
      changes: GetBlockChanges<TType>,
    ) => void;
    addBlock: (input: { block: AnyBlock; select?: boolean }) => void;
    deleteBlock: (id: AnyBlock['id']) => void;
    selectBlock: (blockId: string | null) => void;
    replaceDocument: (document: BlockEditorDocument) => void;
  };
}

type StateInitializer = (
  initialDocument: BlockEditorDocument,
) => StateCreator<BlockEditorStoreState>;

type BlockMap = BlockEditorDocument['blocks'];

function cloneDocument(document: BlockEditorDocument): BlockEditorDocument {
  return structuredClone(document);
}

function getValidSelectedBlockId(
  selectedBlockId: AnyBlock['id'] | null,
  document: BlockEditorDocument,
) {
  if (!selectedBlockId) {
    return null;
  }

  return document.blocks[selectedBlockId] ? selectedBlockId : null;
}

function updateDocumentBlocks(
  state: BlockEditorStoreState,
  recipe: (nextBlocks: BlockMap) => boolean,
) {
  const nextBlocks = { ...state.document.blocks };
  const hasChanges = recipe(nextBlocks);

  if (!hasChanges) {
    return state;
  }

  return {
    ...state,
    document: {
      ...state.document,
      blocks: nextBlocks,
    },
  };
}

const createBlockEditorState: StateInitializer =
  (initialDocument) => (set) => ({
    document: cloneDocument(initialDocument),
    selectedBlockId: null,

    actions: {
      reorderRootBlocks: (rootIds) => {
        set((state) => {
          return updateDocumentBlocks(state, (nextBlocks) => {
            let hasStructuralChanges = false;

            for (const change of buildRootBlockOrder(rootIds)) {
              const currentBlock = nextBlocks[change.id];

              if (!currentBlock || currentBlock.parentId !== null) {
                continue;
              }

              if (currentBlock.sortIndex === change.sortIndex) {
                continue;
              }

              nextBlocks[change.id] = {
                ...currentBlock,
                sortIndex: change.sortIndex,
              };
              hasStructuralChanges = true;
            }

            return hasStructuralChanges;
          });
        });
      },

      reorderChildBlocks: (groupedChildIdsByParent) => {
        set((state) => {
          return updateDocumentBlocks(state, (nextBlocks) => {
            let hasStructuralChanges = false;

            for (const change of buildChildBlockOrder(
              groupedChildIdsByParent,
            )) {
              const currentBlock = nextBlocks[change.id];

              if (!currentBlock || currentBlock.parentId === null) {
                continue;
              }

              if (
                currentBlock.parentId === change.parentId &&
                currentBlock.sortIndex === change.sortIndex
              ) {
                continue;
              }

              nextBlocks[change.id] = {
                ...currentBlock,
                parentId: change.parentId ?? currentBlock.parentId,
                sortIndex: change.sortIndex,
              };
              hasStructuralChanges = true;
            }

            return hasStructuralChanges;
          });
        });
      },

      updateBlock: (id, changes) => {
        set((state) => {
          const {
            id: _id,
            type: _type,
            category: _category,
            version: _version,
            parentId: _parentId,
            sortIndex: _sortIndex,
            ...safeChanges
          } = changes as GetBlockChanges<BlockType> &
            Partial<Record<StructuralBlockKey, unknown>>;

          return updateDocumentBlocks(state, (nextBlocks) => {
            const currentBlock = nextBlocks[id];

            if (!currentBlock) {
              return false;
            }

            nextBlocks[id] = {
              ...currentBlock,
              ...safeChanges,
            };

            return true;
          });
        });
      },

      addBlock: ({ block, select }) => {
        set((state) => {
          if (state.document.blocks[block.id]) {
            return state;
          }

          if (
            block.parentId !== null &&
            !state.document.blocks[block.parentId]
          ) {
            return state;
          }

          const nextBlocks = insertBlockIntoOrder(state.document.blocks, block);

          return {
            ...state,
            selectedBlockId: select === true ? block.id : state.selectedBlockId,
            document: {
              ...state.document,
              blocks: nextBlocks,
            },
          };
        });
      },

      deleteBlock: (id) => {
        set((state) => {
          const currentBlock = state.document.blocks[id];

          if (!currentBlock) {
            return state;
          }

          const deletedBlockIds = getBlockAndDescendantIds(
            state.document.blocks,
            id,
          );
          const nextBlocks = Object.fromEntries(
            Object.entries(state.document.blocks).filter(
              ([blockId]) => !deletedBlockIds.has(blockId),
            ),
          );

          const normalizedBlocks = normalizeSiblingSortIndexes(
            nextBlocks,
            currentBlock.parentId,
          );

          return {
            ...state,
            selectedBlockId:
              state.selectedBlockId &&
              deletedBlockIds.has(state.selectedBlockId)
                ? null
                : state.selectedBlockId,
            document: {
              ...state.document,
              blocks: normalizedBlocks,
            },
          };
        });
      },

      selectBlock: (blockId) => {
        set({ selectedBlockId: blockId });
      },

      replaceDocument: (document) => {
        set((state) => ({
          ...state,
          document: cloneDocument(document),
          selectedBlockId: getValidSelectedBlockId(
            state.selectedBlockId,
            document,
          ),
        }));
      },
    },
  });

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
