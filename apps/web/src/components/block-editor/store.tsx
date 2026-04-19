import {
  createContext,
  useContext,
  useState,
} from 'react';
import type { PartialDeep, SimplifyDeep } from 'type-fest';
import { useStore } from 'zustand';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';
import {
  type AnyBlock,
  type BlockEditorDocument,
  type BlockType
} from './types';


type GetBlock<TType extends BlockType> = Extract<
  AnyBlock,
  { type: TType }
>;

type GetBlockChanges<TType extends BlockType> = SimplifyDeep<
  PartialDeep<Omit<GetBlock<TType>, 'id' | 'type' | 'category'>>
>;

type AssertedBlock<TParams> = TParams extends { assertType: infer TType extends BlockType }
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
  }
}

type StateInitializer = (initialDocument: BlockEditorDocument) => StateCreator<BlockEditorStoreState>;

const createBlockEditorState: StateInitializer = (initialDocument) => () => ({
  document: initialDocument,
  selectedBlock: null,

  actions: {
    addBlock: () => {
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
    },
    deleteBlock: () => {
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
    },
    updateBlock: () => {
      /**
       * - find block in blocks by id
       * - update block with changes 
       */
    },
    selectBlock: () => {
      /** 
       * - set selectedBlock to blockId (can be null to deselect)
       * - only set selectedBlock when block exists
       */
    },
  }
});

export const useCreateBlockEditorStore = (initialDocument: BlockEditorDocument): StoreApi<BlockEditorStoreState> => {
  const [store] = useState(() => createStore(createBlockEditorState(initialDocument)));
  return store;
};

export const BlockEditorStoreContext = createContext<StoreApi<BlockEditorStoreState> | undefined>(
  undefined,
);

export const useBlockEditorStore = (): StoreApi<BlockEditorStoreState> => {
  const store = useContext(BlockEditorStoreContext);

  if (!store) {
    throw new Error('useBlockEditorStore must be used within BlockEditorStoreContext');
  }

  return store;
};

export function useBlockEditorState<TSelectorResult>(
  selector: (state: BlockEditorStoreState) => TSelectorResult,
): TSelectorResult {
  const store = useBlockEditorStore();

  return useStore(store, selector);
}

export const useBlockEditorActions = () => useBlockEditorState((state) => state.actions);

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
    return selector ? selector(assertedBlock) : (assertedBlock as TSelectorReturn);
  });
}
