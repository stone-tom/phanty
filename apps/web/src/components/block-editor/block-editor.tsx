import { CollisionPriority } from '@dnd-kit/abstract';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { GripVertical } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '../ui/button';
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

  return (
    <div className="flex h-full flex-col p-4">
      <h2 className="text-lg font-semibold mb-2">Block Editor</h2>

      <DragDropProvider
        onDragStart={() => {
          prevGroupedBlockIds.current = structuredClone(groupedBlockIds);
        }}
        onDragOver={(event) => {
          setGroupedBlockIds((prev) => move(prev, event));
        }}
        onDragEnd={(event) => {

          if (event.canceled) {
            setGroupedBlockIds(prevGroupedBlockIds.current);
            return;
          }
        }}
      >
        <div className="flex flex-col gap-2">
          {Object.entries(groupedBlockIds).map(([parentId, leafIds]) => (
            <ParentItem key={parentId} id={parentId}>
              {leafIds.map((leafId, index) => (
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
}

function ParentItem(props: ParentItemProps) {
  const { id, children } = props;

  const {
    ref
  } = useDroppable({
    id,
    type: 'parent',
    accept: 'leaf',
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div ref={ref} className="py-2 px-3 border bg-muted/80 rounded-lg">
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

  const { ref, handleRef, isDragging } = useSortable({
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
      className="py-1 px-2 border rounded-lg bg-background flex gap-1 items-center"
    >
      <Button ref={handleRef} variant="ghost" size="icon-sm" className="cursor-move">
        <GripVertical />
      </Button>
      <div>
        {props.id} (index: {props.index})
      </div>
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
