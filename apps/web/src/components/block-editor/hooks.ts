import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import {
  type AssertedBlock,
  type BlockEditorStoreState,
  useBlockEditorStore,
} from './store';
import type { BlockType } from './types';

const EMPTY_BLOCK_IDS: string[] = [];

export function useBlockEditorState<TSelectorResult>(
  selector: (state: BlockEditorStoreState) => TSelectorResult,
): TSelectorResult {
  const store = useBlockEditorStore();
  return useStore(store, selector);
}

export const useBlockById = (id: string) =>
  useBlockEditorState((state) => state.index.byId.get(id));

export const useBlockListKey = (id: string) =>
  useBlockEditorState((state) => state.index.listKeyById.get(id));

export const useBlockIds = (parentId: string | null) => {
  const key = parentId ?? 'root';
  return useBlockEditorState(
    useShallow((state) => state.index.childIdsById.get(key) ?? EMPTY_BLOCK_IDS),
  );
};

export const useBlockChildren = (parentId: string | null) => {
  const key = parentId ?? 'root';
  return useBlockEditorState(
    useShallow((state) => state.document.blocks[key] ?? []),
  );
};

export const useSelectedBlock = () =>
  useBlockEditorState((state) =>
    state.selectedBlock ? state.index.byId.get(state.selectedBlock) : undefined,
  );

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
    const block = state.index.byId.get(params.id);

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
