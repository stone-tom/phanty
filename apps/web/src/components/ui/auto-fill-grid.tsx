import type { ComponentProps, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type AutoFillGridStyle = CSSProperties & {
  [key: `--auto-fill-grid-${string}`]: number | string;
  '--auto-fill-grid-column-count': number;
  '--auto-fill-grid-column-min-width': string;
  '--auto-fill-grid-gap-count': string;
  '--auto-fill-grid-layout-gap': string;
  '--auto-fill-grid-total-gap-width': string;
  '--auto-fill-grid-column-max-width': string;
};

export interface AutoFillGridProps extends ComponentProps<'div'> {
  maxColumns: number;
  columnMinWidth: string;
  gap?: string;
  rowGap?: string;
}

function normalizeGap(gap: string | undefined) {
  return gap?.trim() && gap !== '0' ? gap : '0px';
}

function AutoFillGrid({
  className,
  style,
  maxColumns,
  columnMinWidth,
  gap = '0px',
  rowGap,
  ...props
}: AutoFillGridProps) {
  const columnCount = Math.max(1, Math.floor(maxColumns));
  const columnGap = normalizeGap(gap);
  const resolvedRowGap =
    rowGap === undefined ? columnGap : normalizeGap(rowGap);
  const gridStyle: AutoFillGridStyle = {
    ...style,
    '--auto-fill-grid-column-count': columnCount,
    '--auto-fill-grid-column-min-width': columnMinWidth,
    '--auto-fill-grid-gap-count':
      'calc(var(--auto-fill-grid-column-count) - 1)',
    '--auto-fill-grid-layout-gap': columnGap,
    '--auto-fill-grid-total-gap-width':
      'calc(var(--auto-fill-grid-gap-count) * var(--auto-fill-grid-layout-gap))',
    '--auto-fill-grid-column-max-width':
      'calc((100% - var(--auto-fill-grid-total-gap-width)) / var(--auto-fill-grid-column-count))',
    gridTemplateColumns:
      'repeat(auto-fill, minmax(max(min(var(--auto-fill-grid-column-min-width), 100%), var(--auto-fill-grid-column-max-width)), 1fr))',
    columnGap,
    rowGap: resolvedRowGap,
  };

  return (
    <div
      data-slot="auto-fill-grid"
      className={cn('grid', className)}
      style={gridStyle}
      {...props}
    />
  );
}

export { AutoFillGrid };
