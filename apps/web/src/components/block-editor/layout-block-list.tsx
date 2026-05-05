import { Feedback } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import type { AnyBlock, BlockDefinition } from '@repo/templates';
import { GripVertical, Layers2, Plus } from 'lucide-react';
import { Fragment, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '../ui/button';
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

export function LayoutBlockList() {
  const documentBlocks = useBlockEditorState((state) => state.document.blocks);
  const { reorderRootBlocks, selectBlock, addBlock } = useBlockEditorActions();

  const {
    localState: rootIds,
    setLocalState: setRootIds,
    handleDragStart,
    handleDragEnd,
  } = useSyncedSortableState(documentBlocks, getRootBlockIds);

  const [insertTarget, setInsertTarget] = useState<InsertTarget | null>(null);

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
                  onClick={() => selectBlock(rootId)}
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
    </>
  );
}

interface RootItemProps {
  id: AnyBlock['id'];
  index: number;
  onClick?: () => void;
}

function RootItem(props: RootItemProps) {
  const { id, index, onClick } = props;
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
