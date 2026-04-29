import type { BlockType } from '@repo/templates';
import { useStore } from 'zustand';
import {
  type AssertedBlock,
  type BlockEditorStoreState,
  useBlockEditorStore,
} from './store';

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
