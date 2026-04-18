import {
  type Column,
  flexRender,
  getCoreRowModel,
  type RowData,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import {
  type CSSProperties,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type FormTemplatesTableProps<TData extends RowData> = Pick<
  TableOptions<TData>,
  'columns' | 'data' | 'initialState'
>;

type PinEdgeVisibility = {
  showLeftEdge: boolean;
  showRightEdge: boolean;
};

type PinnedColumnSurface = 'header' | 'body';

type PinnedColumnStyle = CSSProperties & {
  '--pinned-muted-surface'?: string;
};

type PinnedColumnPresentation = {
  className?: string;
  isPinned: boolean;
  style: PinnedColumnStyle;
};

const PINNED_MUTED_SURFACE =
  'color-mix(in oklch, var(--color-background) 50%, var(--color-muted) 50%)';
const PINNED_HEADER_CLASS = 'bg-muted overflow-visible';
const PINNED_BODY_CLASS =
  'bg-background overflow-visible transition-colors hover:bg-(--pinned-muted-surface) group-hover:bg-(--pinned-muted-surface) group-has-aria-expanded:bg-(--pinned-muted-surface) group-data-[state=selected]:bg-(--pinned-muted-surface)';
const PINNED_LEFT_EDGE_CLASS =
  'after:pointer-events-none after:absolute after:top-0 after:right-0 after:z-[1] after:h-full after:w-3 after:translate-x-full after:border-l after:border-border after:bg-gradient-to-r after:from-black/3 after:to-transparent';
const PINNED_RIGHT_EDGE_CLASS =
  'before:pointer-events-none before:absolute before:top-0 before:left-0 before:z-[1] before:h-full before:w-3 before:-translate-x-full before:border-r before:border-border before:bg-gradient-to-l before:from-black/3 before:to-transparent';

function usePinnedEdgeVisibility(
  containerRef: RefObject<HTMLDivElement | null>,
) {
  const [pinEdgeVisibility, setPinEdgeVisibility] = useState<PinEdgeVisibility>(
    {
      showLeftEdge: false,
      showRightEdge: false,
    },
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updatePinEdgeVisibility = () => {
      const maxScrollLeft = Math.max(
        container.scrollWidth - container.clientWidth,
        0,
      );
      const scrollLeft = container.scrollLeft;
      const edgeThreshold = 1;

      setPinEdgeVisibility((current) => {
        const next = {
          showLeftEdge: scrollLeft > edgeThreshold,
          showRightEdge: scrollLeft < maxScrollLeft - edgeThreshold,
        };

        if (
          current.showLeftEdge === next.showLeftEdge &&
          current.showRightEdge === next.showRightEdge
        ) {
          return current;
        }

        return next;
      });
    };

    updatePinEdgeVisibility();

    container.addEventListener('scroll', updatePinEdgeVisibility, {
      passive: true,
    });

    const resizeObserver = new ResizeObserver(updatePinEdgeVisibility);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', updatePinEdgeVisibility);
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return pinEdgeVisibility;
}

function getPinnedColumnPresentation<TData extends RowData>(
  column: Column<TData>,
  options: {
    edges: PinEdgeVisibility;
    surface: PinnedColumnSurface;
  },
): PinnedColumnPresentation {
  const pinned = column.getIsPinned();
  const { edges, surface } = options;

  if (!pinned) {
    return {
      isPinned: false,
      style: {},
    };
  }

  const edgeClassName =
    pinned === 'left' && column.getIsLastColumn('left') && edges.showLeftEdge
      ? PINNED_LEFT_EDGE_CLASS
      : pinned === 'right' &&
          column.getIsFirstColumn('right') &&
          edges.showRightEdge
        ? PINNED_RIGHT_EDGE_CLASS
        : undefined;

  const style: PinnedColumnStyle = {
    position: 'sticky',
    left: pinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: pinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    width: column.getSize(),
  };

  if (surface === 'body') {
    style['--pinned-muted-surface'] = PINNED_MUTED_SURFACE;
  }

  if (surface === 'header') {
    style.top = 0;
  }

  return {
    className: cn(
      surface === 'header' ? PINNED_HEADER_CLASS : PINNED_BODY_CLASS,
      edgeClassName,
    ),
    isPinned: true,
    style,
  };
}

export function FormTemplatesTable<TData extends RowData>(
  props: FormTemplatesTableProps<TData>,
) {
  const { data, columns, initialState } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const pinEdgeVisibility = usePinnedEdgeVisibility(containerRef);

  const table = useReactTable<TData>({
    data,
    columns,
    initialState,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table containerClassName="rounded-md border" containerRef={containerRef}>
      <TableHeader className="bg-muted sticky top-0 z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const pin = getPinnedColumnPresentation(header.column, {
                edges: pinEdgeVisibility,
                surface: 'header',
              });

              return (
                <TableHead
                  key={header.id}
                  className={cn('px-3', pin.isPinned && pin.className)}
                  style={{
                    ...pin.style,
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
              className="group"
            >
              {row.getVisibleCells().map((cell) => {
                const pin = getPinnedColumnPresentation(cell.column, {
                  edges: pinEdgeVisibility,
                  surface: 'body',
                });

                return (
                  <TableCell
                    key={cell.id}
                    className={cn('px-3', pin.isPinned && pin.className)}
                    style={pin.style}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
