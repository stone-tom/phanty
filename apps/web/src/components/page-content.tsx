import type { ComponentProps } from 'react';

export function PageContent(props: ComponentProps<'div'>) {
  return <div className="flex flex-1 flex-col p-4 pt-2">{props.children}</div>;
}
