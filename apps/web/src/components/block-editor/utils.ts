import type { BlockIndex } from './store';
import type { AnyBlock, BlockEditorDocument } from './types';

export function buildIndex(blocks: BlockEditorDocument['blocks']): BlockIndex {
  const byId = new Map<string, AnyBlock>();
  const listKeyById = new Map<string, string>();
  const childIdsById = new Map<string, string[]>();

  for (const key in blocks) {
    const list = blocks[key];
    if (!Array.isArray(list)) continue;

    const childIds: string[] = [];
    for (const block of list) {
      byId.set(block.id, block);
      listKeyById.set(block.id, key);
      childIds.push(block.id);
    }
    childIdsById.set(key, childIds);
  }

  return { byId, listKeyById, childIdsById };
}
