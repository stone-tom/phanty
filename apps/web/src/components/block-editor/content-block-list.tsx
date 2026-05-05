import { CollisionPriority } from '@dnd-kit/abstract';
import { Feedback } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import type { AnyBlock, BlockDefinition } from '@repo/templates';
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Copy,
  FileText,
  GripVertical,
  Layers2,
  Pencil,
  Plus,
  Scissors,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button, buttonVariants } from '../ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ui/context-menu';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty';
import { Separator } from '../ui/separator';
import { createBlockFromDefinition } from './block-factory';
import { BlockPreview } from './block-preview';
import { ChildBlockSelector } from './block-selector';
import {
  useBlockEditorActions,
  useBlockEditorBlock,
  useBlockEditorState,
} from './hooks';
import { type GroupedChildBlockIds, groupChildBlockIds } from './ordering';
import { useSyncedSortableState } from './use-synced-sortable-state';

const OPEN_ON_DROP_TARGET_DELAY_MS = 500;

interface InsertTarget {
  parentId: string;
  index: number;
}

type MoveDirection = 'up' | 'down';

export function ContentBlockList() {
  const documentBlocks = useBlockEditorState((state) => state.document.blocks);
  const { reorderChildBlocks, selectBlock, addBlock, deleteBlock } =
    useBlockEditorActions();

  const {
    localState: groupedChildBlockIds,
    setLocalState: setGroupedChildBlockIds,
    handleDragStart,
    handleDragEnd,
  } = useSyncedSortableState(documentBlocks, groupChildBlockIds);

  const [openParentIds, setOpenParentIds] = useState<AnyBlock['id'][]>(() =>
    Object.keys(groupedChildBlockIds),
  );

  const openParent = useCallback((parentId: AnyBlock['id']) => {
    setOpenParentIds((prev) =>
      prev.includes(parentId) ? prev : [...prev, parentId],
    );
  }, []);

  const [insertTarget, setInsertTarget] = useState<InsertTarget | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<AnyBlock['id'] | null>(
    null,
  );

  const handleAddBlock = (blockDefinition: BlockDefinition) => {
    if (!insertTarget) return;

    const { parentId, index } = insertTarget;

    addBlock({
      block: createBlockFromDefinition({
        definition: blockDefinition,
        parentId,
        sortIndex: index,
      }),
      select: true,
    });
    setInsertTarget(null);
  };

  const handleDeleteBlock = () => {
    if (!deleteTargetId) return;

    deleteBlock(deleteTargetId);
    setDeleteTargetId(null);
  };

  const handleMoveChildBlock = (
    parentId: AnyBlock['id'],
    childId: AnyBlock['id'],
    direction: MoveDirection,
  ) => {
    const childIds = groupedChildBlockIds[parentId];

    if (!childIds) return;

    const currentIndex = childIds.indexOf(childId);
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= childIds.length) {
      return;
    }

    const nextChildIds = [...childIds];
    [nextChildIds[currentIndex], nextChildIds[nextIndex]] = [
      nextChildIds[nextIndex],
      nextChildIds[currentIndex],
    ];

    const nextGroupedChildBlockIds = {
      ...groupedChildBlockIds,
      [parentId]: nextChildIds,
    };

    setGroupedChildBlockIds(nextGroupedChildBlockIds);
    reorderChildBlocks(nextGroupedChildBlockIds);
  };

  return (
    <>
      <DragDropProvider
        onDragStart={handleDragStart}
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
          if (!handleDragEnd(event.canceled)) {
            return;
          }

          reorderChildBlocks(groupedChildBlockIds);
        }}
      >
        {Object.keys(groupedChildBlockIds).length > 0 ? (
          <Accordion
            type="multiple"
            value={openParentIds}
            onValueChange={setOpenParentIds}
            className="gap-2"
          >
            {Object.entries(groupedChildBlockIds).map(
              ([parentId, childIds]) => (
                <RootItem
                  key={parentId}
                  id={parentId}
                  onDropTarget={openParent}
                >
                  {childIds.length > 0 ? (
                    childIds.map((childId, index) => (
                      <ChildItem
                        key={childId}
                        id={childId}
                        index={index}
                        isLast={index === childIds.length - 1}
                        parentId={parentId}
                        canMoveUp={index > 0}
                        canMoveDown={index < childIds.length - 1}
                        onClick={() => selectBlock(childId)}
                        onAddClick={(insertTarget) =>
                          setInsertTarget(insertTarget)
                        }
                        onDeleteClick={() => setDeleteTargetId(childId)}
                        onMoveUpClick={() =>
                          handleMoveChildBlock(parentId, childId, 'up')
                        }
                        onMoveDownClick={() =>
                          handleMoveChildBlock(parentId, childId, 'down')
                        }
                      />
                    ))
                  ) : (
                    <ContainerEmptyState
                      onAddClick={() => setInsertTarget({ index: 0, parentId })}
                    />
                  )}
                </RootItem>
              ),
            )}
          </Accordion>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Layers2 />
              </EmptyMedia>
              <EmptyTitle>No content containers</EmptyTitle>
              <EmptyDescription>
                Add a layout block before adding content blocks.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </DragDropProvider>
      <Dialog
        open={insertTarget !== null}
        onOpenChange={() => {
          setInsertTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add block</DialogTitle>
            <DialogDescription>
              Select the block you want to insert.
            </DialogDescription>
          </DialogHeader>
          <ChildBlockSelector onSelect={handleAddBlock} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTargetId(null);
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete block?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the block from the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteBlock}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface RootItemProps {
  id: AnyBlock['id'];
  children: React.ReactNode;
  onDropTarget: (id: AnyBlock['id']) => void;
}

function RootItem(props: RootItemProps) {
  const { id, children, onDropTarget } = props;
  const block = useBlockEditorBlock({
    id,
  });

  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { ref, isDropTarget } = useDroppable({
    id,
    type: 'root',
    accept: 'child',
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
        className="data-open:animate-none data-open:overflow-visible data-closed:animate-none data-closed:overflow-hidden"
        contentClassName="pb-0"
      >
        <Separator className="bg-primary" />
        <div className="flex min-h-10 flex-col">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface ContainerEmptyStateProps {
  onAddClick: () => void;
}

function ContainerEmptyState(props: ContainerEmptyStateProps) {
  const { onAddClick } = props;

  return (
    <Empty className="rounded-none border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText />
        </EmptyMedia>
        <EmptyTitle>No content blocks</EmptyTitle>
        <EmptyDescription>
          Add a block to this container to start collecting content.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" size="sm" onClick={onAddClick}>
          <Plus />
          Add Block
        </Button>
      </EmptyContent>
    </Empty>
  );
}

interface ChildItemProps {
  id: AnyBlock['id'];
  index: number;
  isLast: boolean;
  parentId: AnyBlock['id'];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onClick: () => void;
  onAddClick: (insertTarget: InsertTarget) => void;
  onDeleteClick: () => void;
  onMoveUpClick: () => void;
  onMoveDownClick: () => void;
}

function ChildItem(props: ChildItemProps) {
  const {
    id,
    index,
    isLast,
    parentId,
    canMoveUp,
    canMoveDown,
    onClick,
    onAddClick,
    onDeleteClick,
    onMoveUpClick,
    onMoveDownClick,
  } = props;

  const { ref, handleRef, isDragging } = useSortable({
    id,
    index,
    type: 'child',
    accept: 'child',
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
          onAddClick({ parentId, index });
        }}
      />
      {isLast ? (
        <InsertSeparator
          position="bottom"
          ariaLabel="Add block below"
          onClick={() => {
            onAddClick({ parentId, index: index + 1 });
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
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className={cn(
              'w-full text-start py-3 pr-3 pl-11 outline-none transition-colors',
              'hover:bg-muted data-[state=open]:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset',
              isLast && 'rounded-b-lg',
            )}
          >
            <BlockPreview blockId={id} />
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuItem onClick={onClick}>
              <Pencil />
              Edit
            </ContextMenuItem>
            <ContextMenuItem disabled>
              <Copy />
              Copy
            </ContextMenuItem>
            <ContextMenuItem disabled>
              <Scissors />
              Cut
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuItem disabled={!canMoveUp} onClick={onMoveUpClick}>
              <ArrowUp />
              Move up
            </ContextMenuItem>
            <ContextMenuItem disabled={!canMoveDown} onClick={onMoveDownClick}>
              <ArrowDown />
              Move down
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuItem onClick={() => onAddClick({ parentId, index })}>
              <ArrowUpToLine />
              Add block above
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAddClick({ parentId, index: index + 1 })}
            >
              <ArrowDownToLine />
              Add block below
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />

          <ContextMenuGroup>
            <ContextMenuItem variant="destructive" onClick={onDeleteClick}>
              <Trash2 />
              Delete
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
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
        'hover:before:bg-primary/50 hover:before:h-0.5 focus-visible:before:bg-primary/50 focus-visible:before:h-0.5',
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
          'opacity-0 transition-opacity group-hover/separator:opacity-100 group-focus-visible/separator:opacity-100',
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
