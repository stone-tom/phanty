import { CollisionPriority } from '@dnd-kit/abstract';
import { Feedback } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { ChevronDown, GripVertical } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useBlockEditorBlock } from './hooks';
import { useBlockEditorStore } from './store';
import type { AnyBlock, BlockEditorDocument } from './types';

type GroupedBlockIds = {
  [parentId: string]: AnyBlock['id'][];
};

export function ContentBlockList() {
  const store = useBlockEditorStore();
  const [groupedBlockIds, setGroupedBlockIds] = useState<GroupedBlockIds>(() =>
    groupBlockIds(store.getState().document.blocks),
  );
  const prevGroupedBlockIds = useRef(groupedBlockIds);

  return (
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
  );
}

interface ParentItemProps {
  id: AnyBlock['id'];
  children: React.ReactNode;
}

function ParentItem(props: ParentItemProps) {
  const { id, children } = props;
  const block = useBlockEditorBlock({
    id,
  });

  const { ref } = useDroppable({
    id,
    type: 'parent',
    accept: 'leaf',
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div ref={ref} className="border overflow-hidden rounded-lg">
      <div
        className={cn(
          'py-1 pl-3 pr-2 flex justify-between items-center',
          'text-primary bg-primary/10 hover:bg-primary/13',
        )}
      >
        <span className="capitalize font-medium">{block.type}</span>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10"
        >
          <ChevronDown />
        </Button>
      </div>
      <Separator />
      <div className="flex flex-col">{children}</div>
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
    plugins: [Feedback.configure({ feedback: 'clone' })],
  });

  return (
    <div
      ref={ref}
      data-dragging={isDragging}
      className={cn(
        'flex gap-1 items-center bg-background ',
        'py-3 px-1.5',
        'border-b last:border-b-0',
        'data-[dnd-placeholder=clone]:opacity-50',
        'hover:bg-muted/50',
        isDragging &&
          'border data-[dnd-placeholder=clone]:border-x-0 data-[dnd-placeholder=clone]:border-t-0',
      )}
    >
      <Button
        ref={handleRef}
        variant="ghost"
        size="icon-sm"
        className="cursor-move"
      >
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
