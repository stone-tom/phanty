import {
  type Column,
  flexRender,
  getCoreRowModel,
  type RowData,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import type { CSSProperties } from 'react';
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

function getPinnedColumnStyles<TData extends RowData>(
  column: Column<TData>,
): CSSProperties {
  const pinned = column.getIsPinned();

  if (!pinned) {
    return {};
  }

  return {
    position: 'sticky',
    left: pinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: pinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    width: column.getSize(),
  };
}

export function FormTemplatesTable<TData extends RowData>(
  props: FormTemplatesTableProps<TData>,
) {
  const { data, columns, initialState } = props;

  const table = useReactTable<TData>({
    data,
    columns,
    initialState,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table containerClassName="rounded-md border">
      <TableHeader className="bg-muted sticky top-0 z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const pinned = header.column.getIsPinned();

              return (
                <TableHead
                  key={header.id}
                  className={cn('px-3', pinned && 'bg-muted/85')}
                  style={{
                    ...getPinnedColumnStyles(header.column),
                    top: 0,
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
              className={cn(
                'group hover:bg-muted/85 has-aria-expanded:bg-muted/85',
              )}
            >
              {row.getVisibleCells().map((cell) => {
                const pinned = cell.column.getIsPinned();

                return (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      'px-3',
                      pinned &&
                        'bg-background/85 transition-colors hover:bg-muted/85 group-hover:bg-muted/85 group-has-aria-expanded:bg-muted/85 group-data-[state=selected]:bg-muted',
                    )}
                    style={getPinnedColumnStyles(cell.column)}
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
