import { cn } from '@/lib/utils';
import {
  CollisionPriority,
  type DragOperation,
  Modifier,
} from '@dnd-kit/abstract';
import { Feedback, KeyboardSensor, PointerSensor } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import {
  type DragDropEventHandlers,
  DragDropProvider,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { GripVertical } from 'lucide-react';
import { memo, useCallback, useRef, useState } from 'react';
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

class SnapCenterToCursor extends Modifier {
  apply({ shape, position, transform }: DragOperation) {
    if (!position.initial || !shape) {
      return transform;
    }

    const { current, initial } = shape;
    const { left, top } = initial.boundingRectangle;
    const { height, width } = current.boundingRectangle;
    const offsetX = position.initial.x - left;
    const offsetY = position.initial.y - top;

    return {
      ...transform,
      x: transform.x + offsetX - width / 2,
      y: transform.y + offsetY - height / 2,
    };
  }
}

const ITEM_PLUGINS = [Feedback.configure({ feedback: 'clone' })];
const COLUMN_MODIFIERS = [SnapCenterToCursor];

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
  const [areColumnsCollapsed, setAreColumnsCollapsed] = useState(false);
  const { replaceBlocks, replaceDocument } = useBlockEditorActions();
  const columnIds = useBlockIds(null);

  const handleBeforeDragStart = useCallback<
    DragDropEventHandlers['onBeforeDragStart']
  >(
    (event) => {
      previousDocumentRef.current = cloneDocument(store.getState().document);
      setAreColumnsCollapsed(event.operation.source?.type === COLUMN_TYPE);
    },
    [store],
  );

  const handleDragOver = useCallback<DragDropEventHandlers['onDragOver']>(
    (event: DragOverEvent) => {
      const { source } = event.operation;

      if (source?.type === COLUMN_TYPE) {
        // We can rely on optimistic sorting for columns.
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
      setAreColumnsCollapsed(false);

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
        onBeforeDragStart={handleBeforeDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          className="group/block-editor flex flex-col gap-2"
          data-columns-collapsed={areColumnsCollapsed}
        >
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
    modifiers: COLUMN_MODIFIERS,
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
        <span className="hidden shrink-0 text-muted-foreground text-xs tabular-nums group-data-[columns-collapsed=true]/block-editor:inline">
          {itemIds.length}
        </span>
        <Button type="button" variant="ghost" size="icon-sm" ref={handleRef}>
          <GripVertical data-icon="inline-start" />
        </Button>
      </div>

      <div
        className={cn(
          'flex min-h-10 flex-col gap-2 rounded-md group-data-[columns-collapsed=true]/block-editor:hidden',
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
