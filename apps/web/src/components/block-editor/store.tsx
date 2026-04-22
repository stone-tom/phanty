import { createContext, useContext, useState } from 'react';
import type { PartialDeep, SimplifyDeep } from 'type-fest';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';
import type { AnyBlock, BlockEditorDocument, BlockType } from './types';

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

  actions: {
    addBlock: (input: {
      block: AnyBlock;
      parentId: string | null;
      sortIndex: number;
      select?: boolean;
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

const createBlockEditorState: StateInitializer =
  (initialDocument) => (set) => ({
    document: initialDocument,
    selectedBlock: null,

    actions: {
      addBlock: (input) => {
        console.log('add block params', { input });
        set((state) => {
          return state;
        });
      },

      deleteBlock: (id) => {
        console.log('delete block params', { id });
        set((state) => {
          return state;
        });
      },

      updateBlock: (id, changes) => {
        console.log('update block params', { id, changes });

        set((state) => {
          return state;
        });
      },

      selectBlock: (blockId) => {
        set({ selectedBlock: blockId });
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
