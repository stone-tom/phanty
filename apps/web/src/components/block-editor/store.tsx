import { createContext, useContext, useState } from 'react';
import type { PartialDeep, SimplifyDeep } from 'type-fest';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';
import {
  buildChildBlockOrder,
  buildRootBlockOrder,
  type GroupedChildBlockIds,
} from './ordering';
import type { AnyBlock, BlockEditorDocument, BlockType } from './types';

type GetBlock<TType extends BlockType> = Extract<AnyBlock, { type: TType }>;

type StructuralBlockKey = 'id' | 'type' | 'category' | 'parentId' | 'sortIndex';

type GetBlockChanges<TType extends BlockType> = SimplifyDeep<
  PartialDeep<Omit<GetBlock<TType>, StructuralBlockKey>>
>;

export type BlockEditorSaveState = 'idle' | 'saving' | 'error';
export type BlockEditorHydrationState = 'idle' | 'hydrating' | 'hydrated';

export type AssertedBlock<TParams> = TParams extends {
  assertType: infer TType extends BlockType;
}
  ? GetBlock<TType>
  : AnyBlock;

export interface BlockEditorStoreState {
  document: BlockEditorDocument;
  lastSavedDocument: BlockEditorDocument;
  selectedBlockId: AnyBlock['id'] | null;
  dirty: boolean;
  saveState: BlockEditorSaveState;
  saveError: string | null;
  hydrationState: BlockEditorHydrationState;

  actions: {
    reorderRootBlocks: (rootIds: AnyBlock['id'][]) => void;
    reorderChildBlocks: (groupedChildIdsByParent: GroupedChildBlockIds) => void;
    updateBlock: <TType extends BlockType>(
      id: string,
      changes: GetBlockChanges<TType>,
    ) => void;
    selectBlock: (blockId: string | null) => void;
    replaceDocument: (document: BlockEditorDocument) => void;
    markSaved: (nextDocument?: BlockEditorDocument) => void;
    resetToLastSaved: () => void;
    setSaveState: (
      saveState: BlockEditorSaveState,
      saveError?: string | null,
    ) => void;
  };
}

type StateInitializer = (
  initialDocument: BlockEditorDocument,
) => StateCreator<BlockEditorStoreState>;

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

const createBlockEditorState: StateInitializer =
  (initialDocument) => (set) => ({
    document: cloneDocument(initialDocument),
    lastSavedDocument: cloneDocument(initialDocument),
    selectedBlockId: null,
    dirty: false,
    saveState: 'idle',
    saveError: null,
    hydrationState: 'idle',

    actions: {
      reorderRootBlocks: (rootIds) => {
        set((state) => {
          const nextBlocks = { ...state.document.blocks };
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

          if (!hasStructuralChanges) {
            return state;
          }

          return {
            ...state,
            document: {
              ...state.document,
              blocks: nextBlocks,
            },
            dirty: true,
            saveError: null,
          };
        });
      },

      reorderChildBlocks: (groupedChildIdsByParent) => {
        set((state) => {
          const nextBlocks = { ...state.document.blocks };
          let hasStructuralChanges = false;

          for (const change of buildChildBlockOrder(groupedChildIdsByParent)) {
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

          if (!hasStructuralChanges) {
            return state;
          }

          return {
            ...state,
            document: {
              ...state.document,
              blocks: nextBlocks,
            },
            dirty: true,
            saveError: null,
          };
        });
      },

      updateBlock: (id, changes) => {
        set((state) => {
          const currentBlock = state.document.blocks[id];

          if (!currentBlock) {
            return state;
          }

          const {
            id: _id,
            type: _type,
            category: _category,
            parentId: _parentId,
            sortIndex: _sortIndex,
            ...safeChanges
          } = changes as GetBlockChanges<BlockType> &
            Partial<Record<StructuralBlockKey, unknown>>;

          return {
            ...state,
            document: {
              ...state.document,
              blocks: {
                ...state.document.blocks,
                [id]: {
                  ...currentBlock,
                  ...safeChanges,
                },
              },
            },
            dirty: true,
            saveError: null,
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
          dirty: false,
          saveError: null,
        }));
      },

      markSaved: (nextDocument) => {
        set((state) => {
          const document = nextDocument
            ? cloneDocument(nextDocument)
            : cloneDocument(state.document);

          return {
            ...state,
            document,
            lastSavedDocument: cloneDocument(document),
            selectedBlockId: getValidSelectedBlockId(
              state.selectedBlockId,
              document,
            ),
            dirty: false,
            saveState: 'idle',
            saveError: null,
          };
        });
      },

      resetToLastSaved: () => {
        set((state) => {
          const document = cloneDocument(state.lastSavedDocument);

          return {
            ...state,
            document,
            selectedBlockId: getValidSelectedBlockId(
              state.selectedBlockId,
              document,
            ),
            dirty: false,
            saveError: null,
          };
        });
      },

      setSaveState: (saveState, saveError = null) => {
        set((state) => ({
          ...state,
          saveState,
          saveError,
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
