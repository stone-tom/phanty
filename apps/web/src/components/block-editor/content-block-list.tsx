import { CollisionPriority } from '@dnd-kit/abstract';
import { Feedback } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { GripVertical, Plus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Button, buttonVariants } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  useBlockEditorActions,
  useBlockEditorBlock,
  useBlockEditorState,
} from './hooks';
import { type GroupedChildBlockIds, groupChildBlockIds } from './ordering';
import type { AnyBlock } from './types';

const OPEN_ON_DROP_TARGET_DELAY_MS = 500;

export function ContentBlockList() {
  const documentBlocks = useBlockEditorState((state) => state.document.blocks);
  const { reorderChildBlocks, selectBlock } = useBlockEditorActions();

  const [groupedChildBlockIds, setGroupedChildBlockIds] =
    useState<GroupedChildBlockIds>(() => groupChildBlockIds(documentBlocks));
  const prevGroupedChildBlockIds = useRef(groupedChildBlockIds);
  const isDraggingRef = useRef(false);

  const [openParentIds, setOpenParentIds] = useState<AnyBlock['id'][]>(() =>
    Object.keys(groupedChildBlockIds),
  );

  const openParent = useCallback((parentId: AnyBlock['id']) => {
    setOpenParentIds((prev) =>
      prev.includes(parentId) ? prev : [...prev, parentId],
    );
  }, []);

  // Keep groupedChildBlockIds in sync with store
  useEffect(() => {
    if (isDraggingRef.current) {
      return;
    }

    setGroupedChildBlockIds(groupChildBlockIds(documentBlocks));
  }, [documentBlocks]);

  return (
    <DragDropProvider
      onDragStart={() => {
        isDraggingRef.current = true;
        prevGroupedChildBlockIds.current =
          structuredClone(groupedChildBlockIds);
      }}
      onDragOver={(event) => {
        const sourceId = event.operation.source?.id;
        const targetId = event.operation.target?.id;

        if (!sourceId || !targetId) {
          event.preventDefault();
          return;
        }

        const sourceParentId = findParentId(groupedChildBlockIds, sourceId);
        const targetParentId = findParentId(groupedChildBlockIds, targetId);

        if (
          sourceParentId &&
          targetParentId &&
          sourceParentId !== targetParentId &&
          !openParentIds.includes(targetParentId)
        ) {
          event.preventDefault();
          return;
        }

        setGroupedChildBlockIds((prev) => move(prev, event));
      }}
      onDragEnd={(event) => {
        isDraggingRef.current = false;

        if (event.canceled) {
          setGroupedChildBlockIds(prevGroupedChildBlockIds.current);
          return;
        }

        reorderChildBlocks(groupedChildBlockIds);
      }}
    >
      <Accordion
        type="multiple"
        value={openParentIds}
        onValueChange={setOpenParentIds}
        className="gap-2"
      >
        {Object.entries(groupedChildBlockIds).map(([parentId, leafIds]) => (
          <ParentItem key={parentId} id={parentId} onDropTarget={openParent}>
            {leafIds.map((leafId, index) => (
              <LeafItem
                key={leafId}
                id={leafId}
                index={index}
                isLast={index === leafIds.length - 1}
                parentId={parentId}
                onClick={() => selectBlock(leafId)}
              />
            ))}
            {leafIds.length === 0 && (
              <Button type="button" variant="outline" size="sm" className="m-2">
                <Plus />
                Add Block
              </Button>
            )}
          </ParentItem>
        ))}
      </Accordion>
    </DragDropProvider>
  );
}

interface ParentItemProps {
  id: AnyBlock['id'];
  children: React.ReactNode;
  onDropTarget: (id: AnyBlock['id']) => void;
}

function ParentItem(props: ParentItemProps) {
  const { id, children, onDropTarget } = props;
  const block = useBlockEditorBlock({
    id,
  });

  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      className="group/parent overflow-visible rounded-lg border border-primary bg-background"
    >
      <AccordionTrigger
        className={cn(
          'rounded-lg bg-primary-soft px-2 py-3 text-primary-soft-foreground',
          'flex items-center justify-between',
          'hover:bg-primary/13 hover:no-underline',
          'group-data-[state="open"]/parent:rounded-b-none',
          isDropTarget && 'group-data-[state="closed"]/parent:bg-primary/25',
        )}
      >
        <span className="capitalize font-medium">{block.type}</span>
      </AccordionTrigger>
      <AccordionContent
        className="data-open:overflow-visible data-closed:overflow-hidden"
        contentClassName="pb-0"
      >
        <Separator className="bg-primary" />
        <div className="flex min-h-10 flex-col">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface LeafItemProps {
  id: AnyBlock['id'];
  index: number;
  isLast: boolean;
  parentId: AnyBlock['id'];
  onClick?: () => void;
}

function LeafItem(props: LeafItemProps) {
  const { id, index, isLast, parentId, onClick } = props;

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
        'relative border-b last:border-b-0',
        'bg-background',
        isLast && 'rounded-b-lg',
        'data-[dnd-placeholder=clone]:opacity-50',
        isDragging &&
          'border data-[dnd-placeholder=clone]:border-x-0 data-[dnd-placeholder=clone]:border-t-0',
      )}
    >
      <InsertSeparator
        position="top"
        ariaLabel="Add block above"
        onClick={() => {
          console.log('add block above', { parentId, index });
        }}
      />
      {isLast ? (
        <InsertSeparator
          position="bottom"
          ariaLabel="Add block below"
          onClick={() => {
            console.log('add block below', { parentId, index: index + 1 });
          }}
        />
      ) : null}
      <span
        ref={handleRef}
        className={cn(
          'absolute top-1/2 left-1.5 z-10 -translate-y-1/2! cursor-move',
          buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
        )}
      >
        <GripVertical />
      </span>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full text-start py-3 pr-1.5 pl-11 outline-none transition-colors',
          'hover:bg-muted/50 focus-visible:bg-primary/50 focus-visible:ring-2 focus-visible:ring-ring/50',
          isLast && 'rounded-b-lg',
        )}
      >
        {props.id} (index: {props.index})
        <br />
        {props.id} (index: {props.index})
        <br />
        {props.id} (index: {props.index})
      </button>
    </div>
  );
}

interface InsertSeparatorProps {
  ariaLabel: string;
  onClick: () => void;
  position: 'top' | 'bottom';
}

function InsertSeparator(props: InsertSeparatorProps) {
  const { ariaLabel, onClick, position } = props;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        'group/separator absolute inset-x-0 z-20 h-6',
        'before:absolute before:left-0 before:right-0 before:top-1/2 before:h-px before:-translate-y-1/2 before:transition-colors',
        'hover:before:bg-primary/50 hover:before:h-0.5',
        position === 'top' && '-top-3',
        position === 'bottom' && '-bottom-3',
      )}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <span
        className={cn(
          'absolute left-1/2 top-1/2 flex size-6 -translate-x-1/2 -translate-y-1/2 p-0.5',
          'items-center justify-center rounded-full bg-primary text-primary-foreground',
          'opacity-0 transition-opacity group-hover/separator:opacity-100',
        )}
      >
        <Plus />
      </span>
    </button>
  );
}

function findParentId(
  groupedChildBlockIds: GroupedChildBlockIds,
  blockId: unknown,
) {
  if (typeof blockId !== 'string') {
    return undefined;
  }

  if (blockId in groupedChildBlockIds) {
    return blockId;
  }

  return Object.entries(groupedChildBlockIds).find(([, blockIds]) =>
    blockIds.includes(blockId),
  )?.[0];
}
