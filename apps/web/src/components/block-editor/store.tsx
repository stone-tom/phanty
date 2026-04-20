import { mergeWith } from 'lodash';
import { createContext, useContext, useState } from 'react';
import type { PartialDeep, SimplifyDeep } from 'type-fest';
import { useStore } from 'zustand';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';
import type { AnyBlock, BlockEditorDocument, BlockType } from './types';

type GetBlock<TType extends BlockType> = Extract<AnyBlock, { type: TType }>;

type StructuralBlockKey = 'id' | 'type' | 'category' | 'parentId' | 'childIds';

type GetBlockChanges<TType extends BlockType> = SimplifyDeep<
  PartialDeep<Omit<GetBlock<TType>, StructuralBlockKey>>
>;

type AssertedBlock<TParams> = TParams extends {
  assertType: infer TType extends BlockType;
}
  ? GetBlock<TType>
  : AnyBlock;

export interface BlockEditorStoreState {
  document: BlockEditorDocument;
  selectedBlock: AnyBlock['id'] | null;

  actions: {
    addBlock: (input: {
      block: AnyBlock;
      index: number;
      select: boolean;
    }) => void;
    deleteBlock: (id: string) => void;
    updateBlock: <TType extends BlockType>(
      id: string,
      changes: GetBlockChanges<TType>,
    ) => void;

    selectBlock: (blockId: string | null) => void;
  };
}

type StateInitializer = (
  initialDocument: BlockEditorDocument,
) => StateCreator<BlockEditorStoreState>;

const insertId = (ids: string[], id: string, index: number): string[] => {
  const nextIndex = Math.min(Math.max(index, 0), ids.length);
  const idsBefore = ids.slice(0, nextIndex);
  const idsAfter = ids.slice(nextIndex);

  return [...idsBefore, id, ...idsAfter];
};

const createBlockEditorState: StateInitializer =
  (initialDocument) => (set) => ({
    document: initialDocument,
    selectedBlock: null,

    actions: {
      addBlock: (input) => {
        /**
         * PATH 1. Add block to root
         * - only container blocks can be added to root
         * - add block to blocks
         * - add block id to rootBlockIds (at the defined index)
         *
         * PATH 2. Add block as child of another block
         * - only form blocks can be added as children
         * - use the form block's parentId to find the parent container
         * - add block to blocks
         * - add block id to parent block's childIds (at the defined index)
         *
         * FINALLY:
         * - if select is true, set selectedBlock to the new block id
         */
        set((state) => {
          if (state.document.blocks[input.block.id]) {
            return state;
          }

          if (input.block.category === 'layout') {
            return {
              document: {
                ...state.document,
                rootBlockIds: insertId(
                  state.document.rootBlockIds,
                  input.block.id,
                  input.index,
                ),
                blocks: {
                  ...state.document.blocks,
                  [input.block.id]: input.block,
                },
              },
              selectedBlock: input.select
                ? input.block.id
                : state.selectedBlock,
            };
          }

          if (input.block.parentId === null) {
            return state;
          }

          const parentBlock = state.document.blocks[input.block.parentId];

          if (parentBlock?.category !== 'layout') {
            return state;
          }

          return {
            document: {
              ...state.document,
              blocks: {
                ...state.document.blocks,
                [input.block.id]: input.block,
                [parentBlock.id]: {
                  ...parentBlock,
                  childIds: insertId(
                    parentBlock.childIds,
                    input.block.id,
                    input.index,
                  ),
                },
              },
            },
            selectedBlock: input.select ? input.block.id : state.selectedBlock,
          };
        });
      },
      deleteBlock: (id) => {
        /**
         * PATH 1. Delete block from root
         * - if the block is a container, also delete all child blocks
         * - remove deleted blocks from blocks
         * - remove block id from rootBlockIds
         *
         * PATH 2. Delete block from parent block
         * - remove block from blocks
         * - remove block id from parent block's childIds
         *
         * FINALLY:
         * - if the deleted block or one of its deleted children is currently selected, set selectedBlock to null
         *
         * */
        set((state) => {
          const block = state.document.blocks[id];

          if (!block) {
            return state;
          }

          const deletedBlockIds = new Set(
            block.category === 'layout' ? [block.id, ...block.childIds] : [id],
          );
          const blocks = { ...state.document.blocks };

          for (const deletedBlockId of deletedBlockIds) {
            delete blocks[deletedBlockId];
          }

          for (const remainingBlock of Object.values(blocks)) {
            if (remainingBlock.category !== 'layout') {
              continue;
            }

            blocks[remainingBlock.id] = {
              ...remainingBlock,
              childIds: remainingBlock.childIds.filter(
                (childId) => !deletedBlockIds.has(childId),
              ),
            };
          }

          return {
            document: {
              ...state.document,
              rootBlockIds: state.document.rootBlockIds.filter(
                (rootBlockId) => !deletedBlockIds.has(rootBlockId),
              ),
              blocks,
            },
            selectedBlock:
              state.selectedBlock && deletedBlockIds.has(state.selectedBlock)
                ? null
                : state.selectedBlock,
          };
        });
      },
      updateBlock: (id, changes) => {
        /**
         * - find block in blocks by id
         * - update block with changes
         * - reordering will be done in a separate action
         */
        set((state) => {
          const block = state.document.blocks[id];

          if (!block) {
            return state;
          }

          return {
            document: {
              ...state.document,
              blocks: {
                ...state.document.blocks,
                [id]: mergeWith(
                  {},
                  block,
                  changes,
                  (_targetValue, sourceValue) =>
                    Array.isArray(sourceValue) ? sourceValue : undefined,
                ),
              },
            },
          };
        });
      },
      selectBlock: (blockId) => {
        /**
         * - set selectedBlock to blockId (can be null to deselect)
         * - only set selectedBlock when block exists
         */
        set((state) => {
          if (blockId === null) {
            return {
              selectedBlock: null,
            };
          }

          if (!state.document.blocks[blockId]) {
            return state;
          }

          return {
            selectedBlock: blockId,
          };
        });
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

export function useBlockEditorState<TSelectorResult>(
  selector: (state: BlockEditorStoreState) => TSelectorResult,
): TSelectorResult {
  const store = useBlockEditorStore();

  return useStore(store, selector);
}

export const useBlockEditorActions = () =>
  useBlockEditorState((state) => state.actions);

export function useBlockEditorBlock<
  TParams extends {
    id: string;
    assertType?: BlockType;
  },
  TSelectorReturn = AssertedBlock<TParams>,
>(
  params: TParams,
  selector?: (block: AssertedBlock<TParams>) => TSelectorReturn,
): TSelectorReturn {
  return useBlockEditorState((state) => {
    const block = state.document.blocks[params.id];

    if (!block) {
      throw new Error(`Block "${params.id}" not found`);
    }

    if (params.assertType !== undefined) {
      if (block.type !== params.assertType) {
        throw new Error(
          `Block "${params.id}" is not of type "${params.assertType}". Given: "${block.type}"`,
        );
      }
    }

    const assertedBlock = block as AssertedBlock<TParams>;
    return selector
      ? selector(assertedBlock)
      : (assertedBlock as TSelectorReturn);
  });
}
