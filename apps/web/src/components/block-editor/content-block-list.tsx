import { CollisionPriority } from '@dnd-kit/abstract';
import { Feedback } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { GripVertical } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useBlockEditorBlock } from './hooks';
import { useBlockEditorStore } from './store';
import type { AnyBlock, BlockEditorDocument } from './types';

type GroupedBlockIds = {
  [parentId: string]: AnyBlock['id'][];
};

const OPEN_ON_DROP_TARGET_DELAY_MS = 600;

export function ContentBlockList() {
  const store = useBlockEditorStore();
  const [groupedBlockIds, setGroupedBlockIds] = useState<GroupedBlockIds>(() =>
    groupBlockIds(store.getState().document.blocks),
  );
  const [openParentIds, setOpenParentIds] = useState<AnyBlock['id'][]>(() =>
    Object.keys(groupedBlockIds),
  );
  const prevGroupedBlockIds = useRef(groupedBlockIds);

  const openParent = useCallback((parentId: AnyBlock['id']) => {
    setOpenParentIds((prev) =>
      prev.includes(parentId) ? prev : [...prev, parentId],
    );
  }, []);

  return (
    <DragDropProvider
      onDragStart={() => {
        prevGroupedBlockIds.current = structuredClone(groupedBlockIds);
      }}
      onDragOver={(event) => {
        const sourceId = event.operation.source?.id;
        const targetId = event.operation.target?.id;

        if (!sourceId || !targetId) {
          event.preventDefault();
          return;
        }

        const sourceParentId = findParentId(groupedBlockIds, sourceId);
        const targetParentId = findParentId(groupedBlockIds, targetId);

        if (
          sourceParentId &&
          targetParentId &&
          sourceParentId !== targetParentId &&
          !openParentIds.includes(targetParentId)
        ) {
          event.preventDefault();
          return;
        }

        setGroupedBlockIds((prev) => move(prev, event));
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          setGroupedBlockIds(prevGroupedBlockIds.current);
          return;
        }
      }}
    >
      <Accordion
        type="multiple"
        value={openParentIds}
        onValueChange={setOpenParentIds}
        className="gap-2"
      >
        {Object.entries(groupedBlockIds).map(([parentId, leafIds]) => (
          <ParentItem key={parentId} id={parentId} onDropTarget={openParent}>
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
      </Accordion>
    </DragDropProvider>
  );
}

interface ParentItemProps {
  id: AnyBlock['id'];
  children: React.ReactNode;
  onAction?: (id: AnyBlock['id']) => void;
  onDropTarget: (id: AnyBlock['id']) => void;
}

function ParentItem(props: ParentItemProps) {
  const { id, children, onAction, onDropTarget } = props;
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const block = useBlockEditorBlock({
    id,
  });

  const { ref, isDropTarget } = useDroppable({
    id,
    type: 'parent',
    accept: 'leaf',
    collisionPriority: CollisionPriority.Low,
  });

  useEffect(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }

    if (isDropTarget) {
      openTimeoutRef.current = setTimeout(() => {
        onDropTarget(id);
        openTimeoutRef.current = null;
      }, OPEN_ON_DROP_TARGET_DELAY_MS);
    }

    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = null;
      }
    };
  }, [id, isDropTarget, onDropTarget]);

  return (
    <AccordionItem
      ref={ref}
      value={id}
      className="group overflow-hidden rounded-lg border border-primary bg-background"
    >
      <div
        className={cn(
          'flex items-center justify-between p-2',
          'text-primary bg-primary/10 hover:bg-primary/13',
          isDropTarget && 'group-data-[state="closed"]:bg-primary/25',
        )}
      >
        <Button
          type="button"
          variant="ghost"
          className="h-auto min-w-0 flex-1 justify-start rounded-sm px-3 py-1 text-primary hover:bg-transparent hover:text-primary"
          onClick={() => {
            onAction?.(id);
          }}
        >
          <span className="truncate capitalize font-medium">{block.type}</span>
        </Button>
        <AccordionTrigger className="hover:bg-primary/10 hover:no-underline size-7 p-0 flex items-center justify-center [&_svg]:ml-0!" />
      </div>
      <AccordionContent className="pb-0">
        <Separator className="bg-primary" />
        <div className="flex min-h-10 flex-col">{children}</div>
      </AccordionContent>
    </AccordionItem>
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

function findParentId(groupedBlockIds: GroupedBlockIds, blockId: unknown) {
  if (typeof blockId !== 'string') {
    return undefined;
  }

  if (blockId in groupedBlockIds) {
    return blockId;
  }

  return Object.entries(groupedBlockIds).find(([, blockIds]) =>
    blockIds.includes(blockId),
  )?.[0];
}

function compareBlocks(a: AnyBlock, b: AnyBlock) {
  return a.sortIndex - b.sortIndex || a.id.localeCompare(b.id);
}
