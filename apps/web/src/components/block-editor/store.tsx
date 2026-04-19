import {
  createContext,
  type PropsWithChildren,
  useContext,
  useRef,
} from 'react';
import { useStore } from 'zustand';
import { createStore, type StoreApi } from 'zustand/vanilla';
import {
  type AnyBlock,
  BLOCK_EDITOR_DOCUMENT_VERSION,
  type BlockEditorDocument,
  type ParentBlock,
  type TemplateType,
} from './types';

type StructuralBlockKey = 'id' | 'parentId' | 'category' | 'type' | 'childIds';

export type EditableBlockPatch<TBlock extends AnyBlock = AnyBlock> =
  TBlock extends AnyBlock ? Partial<Omit<TBlock, StructuralBlockKey>> : never;

export interface AddBlockInput {
  block: AnyBlock;
  parentId?: string | null;
  index?: number;
  select?: boolean;
}

export interface BlockEditorStoreState {
  document: BlockEditorDocument;
  selectedBlockId: string | null;
  isDirty: boolean;
  setDocument: (document: BlockEditorDocument) => void;
  selectBlock: (blockId: string | null) => void;
  addBlock: (input: AddBlockInput) => void;
  deleteBlock: (blockId: string) => void;
  updateBlock: <TBlock extends AnyBlock>(
    blockId: string,
    patch: EditableBlockPatch<TBlock>,
  ) => void;
}

export type BlockEditorStoreApi = StoreApi<BlockEditorStoreState>;

export interface BlockEditorStoreProviderProps {
  document?: BlockEditorDocument;
}

export function createEmptyBlockEditorDocument(
  templateType: TemplateType = 'form',
): BlockEditorDocument {
  return {
    version: BLOCK_EDITOR_DOCUMENT_VERSION,
    templateType,
    rootBlockIds: [],
    blocks: {},
  };
}

export function createBlockEditorStore(
  initialDocument: BlockEditorDocument = createEmptyBlockEditorDocument(),
): BlockEditorStoreApi {
  return createStore<BlockEditorStoreState>()((set) => ({
    document: initialDocument,
    selectedBlockId: null,
    isDirty: false,
    setDocument: (document) =>
      set({
        document,
        selectedBlockId: null,
        isDirty: false,
      }),
    selectBlock: (blockId) =>
      set((state) => ({
        selectedBlockId:
          blockId === null || state.document.blocks[blockId] ? blockId : null,
      })),
    addBlock: (input) =>
      set((state) => {
        const nextDocument = addBlockToDocument(state.document, input);

        if (nextDocument === state.document) {
          return state;
        }

        return {
          document: nextDocument,
          selectedBlockId:
            (input.select ?? true) ? input.block.id : state.selectedBlockId,
          isDirty: true,
        };
      }),
    deleteBlock: (blockId) =>
      set((state) => {
        const deletedBlockIds = getBlockTreeIds(state.document, blockId);

        if (deletedBlockIds.size === 0) {
          return state;
        }

        return {
          document: deleteBlocksFromDocument(state.document, deletedBlockIds),
          selectedBlockId:
            state.selectedBlockId && deletedBlockIds.has(state.selectedBlockId)
              ? null
              : state.selectedBlockId,
          isDirty: true,
        };
      }),
    updateBlock: (blockId, patch) =>
      set((state) => {
        const nextDocument = updateBlockInDocument(
          state.document,
          blockId,
          patch,
        );

        if (nextDocument === state.document) {
          return state;
        }

        return {
          document: nextDocument,
          isDirty: true,
        };
      }),
  }));
}

const BlockEditorStoreContext = createContext<BlockEditorStoreApi | null>(null);

export function BlockEditorStoreProvider(
  props: PropsWithChildren<BlockEditorStoreProviderProps>,
) {
  const storeRef = useRef<BlockEditorStoreApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createBlockEditorStore(props.document);
  }

  return (
    <BlockEditorStoreContext.Provider value={storeRef.current}>
      {props.children}
    </BlockEditorStoreContext.Provider>
  );
}

export function useBlockEditorStore<TSelection>(
  selector: (state: BlockEditorStoreState) => TSelection,
): TSelection {
  const store = useContext(BlockEditorStoreContext);

  if (!store) {
    throw new Error(
      'useBlockEditorStore must be used within BlockEditorStoreProvider',
    );
  }

  return useStore(store, selector);
}

export function isParentBlock(block: AnyBlock): block is ParentBlock {
  return 'childIds' in block;
}

export function getBlock(
  document: BlockEditorDocument,
  blockId: string,
): AnyBlock | null {
  return document.blocks[blockId] ?? null;
}

export function addBlockToDocument(
  document: BlockEditorDocument,
  input: AddBlockInput,
): BlockEditorDocument {
  if (document.blocks[input.block.id]) {
    return document;
  }

  const parentId = input.parentId ?? input.block.parentId;
  const block = {
    ...input.block,
    parentId,
  } as AnyBlock;

  if (parentId === null) {
    return {
      ...document,
      rootBlockIds: insertId(document.rootBlockIds, block.id, input.index),
      blocks: {
        ...document.blocks,
        [block.id]: block,
      },
    };
  }

  const parentBlock = document.blocks[parentId];

  if (!parentBlock || !isParentBlock(parentBlock)) {
    return document;
  }

  return {
    ...document,
    blocks: {
      ...document.blocks,
      [block.id]: block,
      [parentBlock.id]: {
        ...parentBlock,
        childIds: insertId(parentBlock.childIds, block.id, input.index),
      },
    },
  };
}

export function deleteBlocksFromDocument(
  document: BlockEditorDocument,
  blockIds: Set<string>,
): BlockEditorDocument {
  const blocks = { ...document.blocks };

  for (const blockId of blockIds) {
    delete blocks[blockId];
  }

  for (const block of Object.values(blocks)) {
    if (!isParentBlock(block)) {
      continue;
    }

    const childIds = block.childIds.filter((childId) => !blockIds.has(childId));

    if (childIds.length !== block.childIds.length) {
      blocks[block.id] = {
        ...block,
        childIds,
      };
    }
  }

  return {
    ...document,
    rootBlockIds: document.rootBlockIds.filter(
      (blockId) => !blockIds.has(blockId),
    ),
    blocks,
  };
}

export function updateBlockInDocument<TBlock extends AnyBlock>(
  document: BlockEditorDocument,
  blockId: string,
  patch: EditableBlockPatch<TBlock>,
): BlockEditorDocument {
  const block = document.blocks[blockId];

  if (!block) {
    return document;
  }

  return {
    ...document,
    blocks: {
      ...document.blocks,
      [blockId]: {
        ...block,
        ...patch,
      } as AnyBlock,
    },
  };
}

function getBlockTreeIds(
  document: BlockEditorDocument,
  blockId: string,
  blockIds = new Set<string>(),
): Set<string> {
  const block = document.blocks[blockId];

  if (!block || blockIds.has(block.id)) {
    return blockIds;
  }

  blockIds.add(block.id);

  if (isParentBlock(block)) {
    for (const childId of block.childIds) {
      getBlockTreeIds(document, childId, blockIds);
    }
  }

  return blockIds;
}

function insertId(ids: string[], id: string, index = ids.length): string[] {
  const idsWithoutTarget = ids.filter((currentId) => currentId !== id);
  const nextIndex = Math.min(Math.max(index, 0), idsWithoutTarget.length);

  return [
    ...idsWithoutTarget.slice(0, nextIndex),
    id,
    ...idsWithoutTarget.slice(nextIndex),
  ];
}
