import type { AnyBlock, BlockEditorDocument } from '@repo/templates';

export type GroupedChildBlockIds = Record<AnyBlock['id'], AnyBlock['id'][]>;
type BlockMap = BlockEditorDocument['blocks'];

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

function getSiblingBlocks(blocks: BlockMap, parentId: AnyBlock['id'] | null) {
  return parentId === null
    ? getRootBlocks(blocks)
    : getChildBlocks(blocks, parentId);
}

function applySortIndexes(blocks: BlockMap, orderedBlocks: AnyBlock[]) {
  let nextBlocks: BlockMap | undefined;

  for (const [sortIndex, block] of orderedBlocks.entries()) {
    const currentBlock = blocks[block.id] ?? block;

    if (blocks[block.id] && currentBlock.sortIndex === sortIndex) {
      continue;
    }

    nextBlocks ??= { ...blocks };
    nextBlocks[block.id] = {
      ...currentBlock,
      sortIndex,
    };
  }

  return nextBlocks ?? blocks;
}

export function getBlockAndDescendantIds(
  blocks: BlockMap,
  blockId: AnyBlock['id'],
) {
  const blockIds = new Set<AnyBlock['id']>([blockId]);
  const pendingBlockIds = [blockId];

  while (pendingBlockIds.length > 0) {
    const parentId = pendingBlockIds.shift();

    if (!parentId) {
      continue;
    }

    for (const childBlock of getChildBlocks(blocks, parentId)) {
      if (blockIds.has(childBlock.id)) {
        continue;
      }

      blockIds.add(childBlock.id);
      pendingBlockIds.push(childBlock.id);
    }
  }

  return blockIds;
}

export function normalizeSiblingSortIndexes(
  blocks: BlockMap,
  parentId: AnyBlock['id'] | null,
) {
  return applySortIndexes(blocks, getSiblingBlocks(blocks, parentId));
}

export function insertBlockIntoOrder(blocks: BlockMap, block: AnyBlock) {
  const siblings = getSiblingBlocks(blocks, block.parentId);
  const orderedSiblings = [...siblings];

  orderedSiblings.splice(block.sortIndex, 0, block);

  return applySortIndexes(blocks, orderedSiblings);
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
