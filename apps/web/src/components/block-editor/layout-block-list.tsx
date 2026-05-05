import { Feedback } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import type { AnyBlock, BlockDefinition } from '@repo/templates';
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Copy,
  GripVertical,
  Layers2,
  Pencil,
  Plus,
  Scissors,
  Trash2,
} from 'lucide-react';
import { Fragment, useState } from 'react';
import { cn } from '@/lib/utils';
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
import { createBlockFromDefinition } from './block-factory';
import { RootBlockSelector } from './block-selector';
import {
  useBlockEditorActions,
  useBlockEditorBlock,
  useBlockEditorState,
} from './hooks';
import { getRootBlockIds } from './ordering';
import { useSyncedSortableState } from './use-synced-sortable-state';

interface InsertTarget {
  index: number;
}

type MoveDirection = 'up' | 'down';

export function LayoutBlockList() {
  const documentBlocks = useBlockEditorState((state) => state.document.blocks);
  const { reorderRootBlocks, selectBlock, addBlock, deleteBlock } =
    useBlockEditorActions();

  const {
    localState: rootIds,
    setLocalState: setRootIds,
    handleDragStart,
    handleDragEnd,
  } = useSyncedSortableState(documentBlocks, getRootBlockIds);

  const [insertTarget, setInsertTarget] = useState<InsertTarget | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<AnyBlock['id'] | null>(
    null,
  );

  const handleAddBlock = (blockDefinition: BlockDefinition) => {
    if (!insertTarget) return;

    addBlock({
      block: createBlockFromDefinition({
        definition: blockDefinition,
        parentId: null,
        sortIndex: insertTarget.index,
      }),
      select: false,
    });
    setInsertTarget(null);
  };

  const handleDeleteBlock = () => {
    if (!deleteTargetId) return;

    // Keep sortable local state in sync immediately so deleted root ids do not render for one stale frame.
    setRootIds((prev) => prev.filter((rootId) => rootId !== deleteTargetId));
    deleteBlock(deleteTargetId);
    setDeleteTargetId(null);
  };

  const handleMoveRootBlock = (
    rootId: AnyBlock['id'],
    direction: MoveDirection,
  ) => {
    const currentIndex = rootIds.indexOf(rootId);
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= rootIds.length) {
      return;
    }

    const nextRootIds = [...rootIds];
    [nextRootIds[currentIndex], nextRootIds[nextIndex]] = [
      nextRootIds[nextIndex],
      nextRootIds[currentIndex],
    ];

    setRootIds(nextRootIds);
    reorderRootBlocks(nextRootIds);
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

          setRootIds((prev) => move(prev, event));
        }}
        onDragEnd={(event) => {
          if (!handleDragEnd(event.canceled)) {
            return;
          }

          reorderRootBlocks(rootIds);
        }}
      >
        {rootIds.length > 0 ? (
          <div className="flex flex-col">
            {rootIds.map((rootId, index) => (
              <Fragment key={rootId}>
                <InsertSeparator
                  ariaLabel="Add layout block above"
                  onClick={() => {
                    setInsertTarget({ index });
                  }}
                />
                <RootItem
                  id={rootId}
                  index={index}
                  canMoveUp={index > 0}
                  canMoveDown={index < rootIds.length - 1}
                  onClick={() => selectBlock(rootId)}
                  onAddClick={(insertTarget) => setInsertTarget(insertTarget)}
                  onDeleteClick={() => setDeleteTargetId(rootId)}
                  onMoveUpClick={() => handleMoveRootBlock(rootId, 'up')}
                  onMoveDownClick={() => handleMoveRootBlock(rootId, 'down')}
                />
              </Fragment>
            ))}
            <InsertSeparator
              ariaLabel="Add layout block below"
              onClick={() => {
                setInsertTarget({ index: rootIds.length });
              }}
            />
          </div>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Layers2 />
              </EmptyMedia>
              <EmptyTitle>No layout blocks</EmptyTitle>
              <EmptyDescription>
                Add a container to start building the template layout.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                type="button"
                size="sm"
                onClick={() => setInsertTarget({ index: 0 })}
              >
                <Plus />
                Add layout block
              </Button>
            </EmptyContent>
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
            <DialogTitle>Add layout block</DialogTitle>
            <DialogDescription>
              Select the layout block you want to insert.
            </DialogDescription>
          </DialogHeader>
          <RootBlockSelector onSelect={handleAddBlock} />
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
            <AlertDialogTitle>Delete layout block?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the layout block and all content blocks inside
              it.
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
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onClick?: () => void;
  onAddClick: (insertTarget: InsertTarget) => void;
  onDeleteClick: () => void;
  onMoveUpClick: () => void;
  onMoveDownClick: () => void;
}

function RootItem(props: RootItemProps) {
  const {
    id,
    index,
    canMoveUp,
    canMoveDown,
    onClick,
    onAddClick,
    onDeleteClick,
    onMoveUpClick,
    onMoveDownClick,
  } = props;
  const block = useBlockEditorBlock({ id });
  const { ref, handleRef, isDragging } = useSortable({
    id,
    index,
    type: 'root',
    accept: 'root',
    plugins: [Feedback.configure({ feedback: 'clone' })],
  });

  return (
    <div
      ref={ref}
      data-dragging={isDragging}
      className={cn(
        'relative rounded-lg border border-primary bg-background',
        'data-[dnd-placeholder=clone]:opacity-50',
      )}
    >
      <span
        ref={handleRef}
        className={cn(
          'absolute top-1/2 left-1.5 z-10 -translate-y-1/2! cursor-move',
          buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
          'text-primary-soft-foreground hover:bg-primary/13 hover:text-primary-soft-foreground focus-visible:bg-primary/20 focus-visible:text-primary-soft-foreground',
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
              'w-full rounded-lg bg-primary-soft py-3 pr-1.5 pl-11 text-start text-primary-soft-foreground outline-none transition-colors',
              'hover:bg-primary/13 focus-visible:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring/50',
            )}
          >
            <span className="capitalize font-medium">{block.type}</span>
            <br />
            <span className="text-xs text-primary-soft-foreground/80">
              {block.id}
            </span>
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
            <ContextMenuItem onClick={() => onAddClick({ index })}>
              <ArrowUpToLine />
              Add block above
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAddClick({ index: index + 1 })}>
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
}

function InsertSeparator(props: InsertSeparatorProps) {
  const { ariaLabel, onClick } = props;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        'group/separator relative z-20 -my-2 h-6 w-full',
        'before:absolute before:left-0 before:right-0 before:top-1/2 before:h-px before:-translate-y-1/2 before:transition-colors',
        'hover:before:bg-primary/50 hover:before:h-0.5 focus-visible:before:bg-primary/50 focus-visible:before:h-0.5',
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
