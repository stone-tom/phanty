import { CollisionPriority } from '@dnd-kit/abstract';
import { Feedback, KeyboardSensor, PointerSensor } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import {
  type DragDropEventHandlers,
  DragDropProvider,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { GripVertical } from 'lucide-react';
import { memo, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import {
  useBlockEditorActions,
  useBlockEditorBlock,
  useBlockIds,
} from './hooks';
import { useBlockEditorStore } from './store';
import type { AnyBlock, BlockEditorDocument } from './types';

const COLUMN_TYPE = 'column';
const ITEM_TYPE = 'item';
const ITEM_PLUGINS = [Feedback.configure({ feedback: 'clone' })];

const sensors = [
  PointerSensor.configure({
    activatorElements(source) {
      return [source.element, source.handle];
    },
  }),
  KeyboardSensor,
];

export function BlockEditor() {
  const store = useBlockEditorStore();
  const previousDocumentRef = useRef<BlockEditorDocument | null>(null);
  const { replaceBlocks, replaceDocument } = useBlockEditorActions();
  const columnIds = useBlockIds(null);

  const handleDragStart = useCallback<DragDropEventHandlers['onDragStart']>(
    (_event: DragStartEvent) => {
      previousDocumentRef.current = cloneDocument(store.getState().document);
    },
    [store],
  );

  const handleDragOver = useCallback<DragDropEventHandlers['onDragOver']>(
    (event: DragOverEvent) => {
      const { source } = event.operation;

      if (source?.type === COLUMN_TYPE) {
        //We can rely on optimistic sorting for columns.
        return;
      }

      const currentBlocks = store.getState().document.blocks;
      const currentItemGroups = getItemGroups(currentBlocks);
      const nextItemGroups = move(currentItemGroups, event);

      if (nextItemGroups !== currentItemGroups) {
        replaceBlocks({ ...currentBlocks, ...nextItemGroups });
      }
    },
    [replaceBlocks, store],
  );

  const handleDragEnd = useCallback<DragDropEventHandlers['onDragEnd']>(
    (event: DragEndEvent) => {
      const previousDocument = previousDocumentRef.current;
      previousDocumentRef.current = null;

      if (event.canceled) {
        if (previousDocument) {
          replaceDocument(previousDocument);
        }
        return;
      }
    },
    [replaceDocument],
  );

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <h2 className="text-lg font-semibold">Block Editor</h2>

      <DragDropProvider
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-2">
          {columnIds.map((columnId, index) => (
            <SortableColumn key={columnId} id={columnId} index={index} />
          ))}
        </div>
      </DragDropProvider>
    </div>
  );
}

const SortableColumn = memo(function SortableColumn(props: {
  id: string;
  index: number;
}) {
  const block = useBlockEditorBlock({ id: props.id });
  const itemIds = useBlockIds(props.id);

  const { ref, handleRef, isDragging } = useSortable({
    id: props.id,
    accept: [COLUMN_TYPE, ITEM_TYPE],
    collisionPriority: CollisionPriority.Low,
    type: COLUMN_TYPE,
    index: props.index,
    data: { block },
  });

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-2 rounded-md border bg-background p-2.5',
        isDragging && 'opacity-40',
      )}
      aria-hidden={isDragging || undefined}
    >
      <div className="flex items-center gap-2.5">
        <span className="min-w-0 flex-1 truncate text-sm">
          {block.type} ({block.id})
        </span>
        <Button type="button" variant="ghost" size="icon-sm" ref={handleRef}>
          <GripVertical data-icon="inline-start" />
        </Button>
      </div>

      <div
        className={cn(
          'flex min-h-10 flex-col gap-2 rounded-md',
          itemIds.length === 0 && 'border border-dashed',
        )}
      >
        {itemIds.map((itemId, index) => (
          <SortableItem
            key={itemId}
            id={itemId}
            column={props.id}
            index={index}
          />
        ))}
      </div>
    </div>
  );
});

const SortableItem = memo(function SortableItem(props: {
  column: string;
  id: string;
  index: number;
}) {
  const block = useBlockEditorBlock({ id: props.id });

  const { ref, handleRef, isDragging } = useSortable({
    id: props.id,
    group: props.column,
    accept: ITEM_TYPE,
    type: ITEM_TYPE,
    plugins: ITEM_PLUGINS,
    index: props.index,
    data: { block },
  });

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-2.5 rounded-md border bg-background p-2.5',
        isDragging && 'opacity-40',
      )}
      aria-hidden={isDragging || undefined}
    >
      <span className="min-w-0 flex-1 truncate text-sm">
        {block.type} ({block.id})
      </span>
      <Button type="button" variant="ghost" size="icon-sm" ref={handleRef}>
        <GripVertical data-icon="inline-start" />
      </Button>
    </div>
  );
});

function cloneDocument(document: BlockEditorDocument): BlockEditorDocument {
  return structuredClone(document);
}

function getItemGroups(
  blocks: BlockEditorDocument['blocks'],
): Record<string, AnyBlock[]> {
  const itemGroups: Record<string, AnyBlock[]> = {};

  for (const column of blocks.root) {
    itemGroups[column.id] = blocks[column.id] ?? [];
  }

  return itemGroups;
}
