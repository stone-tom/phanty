import { Feedback } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { GripVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';
import {
  useBlockEditorActions,
  useBlockEditorBlock,
  useBlockEditorState,
} from './hooks';
import { getRootBlocks } from './ordering';
import type { AnyBlock } from './types';

export function LayoutBlockList() {
  const documentBlocks = useBlockEditorState((state) => state.document.blocks);
  const { reorderRootBlocks, selectBlock } = useBlockEditorActions();

  const [rootIds, setRootIds] = useState<AnyBlock['id'][]>(() =>
    getRootBlocks(documentBlocks).map((block) => block.id),
  );
  const prevRootIds = useRef(rootIds);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (isDraggingRef.current) {
      return;
    }

    setRootIds(getRootBlocks(documentBlocks).map((block) => block.id));
  }, [documentBlocks]);

  return (
    <DragDropProvider
      onDragStart={() => {
        isDraggingRef.current = true;
        prevRootIds.current = structuredClone(rootIds);
      }}
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
        isDraggingRef.current = false;

        if (event.canceled) {
          setRootIds(prevRootIds.current);
          return;
        }

        reorderRootBlocks(rootIds);
      }}
    >
      <div className="flex flex-col gap-2">
        {rootIds.map((rootId, index) => (
          <RootItem
            key={rootId}
            id={rootId}
            index={index}
            onClick={() => selectBlock(rootId)}
          />
        ))}
      </div>
    </DragDropProvider>
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
        'relative overflow-hidden rounded-lg border border-primary bg-background',
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
