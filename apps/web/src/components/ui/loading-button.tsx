import { Button as ButtonPrimitive } from '@base-ui/react/button';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';
import { Spinner } from './spinner';

function LoadingButton({
	className,
	variant = 'default',
	size = 'default',
	loading,
	children,
	...props
}: ButtonPrimitive.Props &
	VariantProps<typeof buttonVariants> & { loading?: boolean }) {
	return (
		<ButtonPrimitive
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			disabled={loading || props.disabled}
			{...props}
		>
			{loading && <Spinner className="absolute" />}
			<span className={cn(loading && 'opacity-0')}>{children}</span>
		</ButtonPrimitive>
	);
}

export { buttonVariants, LoadingButton };
