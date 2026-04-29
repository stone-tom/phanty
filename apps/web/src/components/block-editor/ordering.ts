import type { AnyBlock, BlockEditorDocument } from '@repo/templates';

export type GroupedChildBlockIds = Record<AnyBlock['id'], AnyBlock['id'][]>;

export interface BlockOrderChange {
  id: AnyBlock['id'];
  parentId: AnyBlock['id'] | null;
  sortIndex: number;
}

export function compareBlocks(a: AnyBlock, b: AnyBlock) {
  return a.sortIndex - b.sortIndex || a.id.localeCompare(b.id);
}

export function getRootBlocks(blocks: BlockEditorDocument['blocks']) {
  return Object.values(blocks)
    .filter((block) => block.parentId === null)
    .toSorted(compareBlocks);
}

export function getRootBlockIds(blocks: BlockEditorDocument['blocks']) {
  return getRootBlocks(blocks).map((block) => block.id);
}

export function getChildBlocks(
  blocks: BlockEditorDocument['blocks'],
  parentId: AnyBlock['id'],
) {
  return Object.values(blocks)
    .filter((block) => block.parentId === parentId)
    .toSorted(compareBlocks);
}

export function groupChildBlockIds(
  blocks: BlockEditorDocument['blocks'],
): GroupedChildBlockIds {
  const groupedChildIds: GroupedChildBlockIds = {};

  for (const rootBlock of getRootBlocks(blocks)) {
    groupedChildIds[rootBlock.id] = [];
  }

  for (const rootBlockId of Object.keys(groupedChildIds)) {
    groupedChildIds[rootBlockId] = getChildBlocks(blocks, rootBlockId).map(
      (block) => block.id,
    );
  }

  return groupedChildIds;
}

export function buildRootBlockOrder(
  rootIds: AnyBlock['id'][],
): BlockOrderChange[] {
  return rootIds.map((id, sortIndex) => ({
    id,
    parentId: null,
    sortIndex,
  }));
}

export function buildChildBlockOrder(
  groupedChildIdsByParent: GroupedChildBlockIds,
): BlockOrderChange[] {
  return Object.entries(groupedChildIdsByParent).flatMap(
    ([parentId, childIds]) =>
      childIds.map((id, sortIndex) => ({
        id,
        parentId,
        sortIndex,
      })),
  );
}
