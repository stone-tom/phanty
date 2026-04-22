import { CollisionPriority } from '@dnd-kit/abstract';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { useRef, useState } from 'react';
import { useBlockEditorStore } from './store';
import type { AnyBlock, BlockEditorDocument } from './types';

type GroupedBlockIds = {
  [parentId: string]: AnyBlock['id'][];
};

export function BlockEditor() {
  const store = useBlockEditorStore();
  const [groupedBlockIds, setGroupedBlockIds] = useState<GroupedBlockIds>(() =>
    groupBlockIds(store.getState().document.blocks),
  );
  const prevGroupedBlockIds = useRef(groupedBlockIds);

  const [parentOrder, setParentOrder] = useState(() =>
    Object.keys(groupedBlockIds),
  );

  return (
    <div className="flex h-full flex-col p-4">
      <h2 className="text-lg font-semibold mb-2">Block Editor</h2>

      <DragDropProvider
        onDragStart={() => {
          prevGroupedBlockIds.current = groupedBlockIds;
        }}
        onDragOver={(event) => {
          const { source } = event.operation;

          if (source?.type === 'parent') return;

          setGroupedBlockIds((prev) => move(prev, event));
        }}
        onDragEnd={(event) => {
          const { source } = event.operation;

          if (event.canceled) {
            if (source?.type === 'leaf') {
              setGroupedBlockIds(prevGroupedBlockIds.current);
            }
            return;
          }

          if (source?.type === 'parent') {
            setParentOrder((prev) => move(prev, event));
          }
        }}
      >
        <div className="flex flex-col gap-2">
          {parentOrder.map((parentId, index) => (
            <ParentItem key={parentId} id={parentId} index={index}>
              {groupedBlockIds[parentId].map((leafId, index) => (
                <LeafItem
                  key={leafId}
                  id={leafId}
                  index={index}
                  parentId={parentId}
                />
              ))}
            </ParentItem>
          ))}
        </div>
      </DragDropProvider>
    </div>
  );
}

interface ParentItemProps {
  id: AnyBlock['id'];
  children: React.ReactNode;
  index: number;
}

function ParentItem(props: ParentItemProps) {
  const { id, children, index } = props;
  const { ref } = useSortable({
    id,
    index,
    type: 'parent',
    collisionPriority: CollisionPriority.Low,
    accept: ['leaf', 'parent'],
  });

  // Do this if we do not need to sort parent items and use seperate layout reorder mode.
  // const { isDropTarget, ref } = useDroppable({
  //   id,
  //   type: 'parent',
  //   accept: 'leaf',
  //   collisionPriority: CollisionPriority.Low,
  // });

  return (
    <div ref={ref} className="py-2 px-3 border bg-muted rounded-lg">
      {props.id}
      <div className="my-2 flex flex-col gap-2">{children}</div>
    </div>
  );
}

interface LeafItemProps {
  id: AnyBlock['id'];
  index: number;
  parentId: AnyBlock['id'];
}

function LeafItem(props: LeafItemProps) {
  const { id, index, parentId } = props;

  const { ref, isDragging } = useSortable({
    id,
    index,
    type: 'leaf',
    accept: 'leaf',
    group: parentId,
  });

  return (
    <div
      ref={ref}
      data-dragging={isDragging}
      className="py-1 px-2 border rounded-lg bg-background"
    >
      {props.id} (index: {props.index})
    </div>
  );
}

function groupBlockIds(blocks: BlockEditorDocument['blocks']): GroupedBlockIds {
  const groupedBlockIds: GroupedBlockIds = {};
  const parentBlocks = Object.values(blocks)
    .filter((block) => block.parentId === null)
    .toSorted(compareBlocks);

  for (const parentBlock of parentBlocks) {
    groupedBlockIds[parentBlock.id] = [];
  }

  for (const block of Object.values(blocks)) {
    if (block.parentId === null) {
      continue;
    }

    const parentKey = block.parentId;
    groupedBlockIds[parentKey] ??= [];
    groupedBlockIds[parentKey].push(block.id);
  }

  for (const [parentKey, blockIds] of Object.entries(groupedBlockIds)) {
    groupedBlockIds[parentKey] = blockIds.toSorted((a, b) =>
      compareBlocks(blocks[a], blocks[b]),
    );
  }

  return groupedBlockIds;
}

function compareBlocks(a: AnyBlock, b: AnyBlock) {
  return a.sortIndex - b.sortIndex || a.id.localeCompare(b.id);
}
