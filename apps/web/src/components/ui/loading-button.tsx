import type { VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';
import { Spinner } from './spinner';

export function LoadingButton({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  loading,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner className="absolute" />}
      <span className={cn(loading && 'opacity-0')}>{children}</span>
    </Comp>
  );
}
