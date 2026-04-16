import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function PageContent(props: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        'flex flex-1 flex-col p-4 pt-2 overflow-y-auto',
        props.className,
      )}
    />
  );
}
