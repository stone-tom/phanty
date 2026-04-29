import type { TextFormBlock } from '@repo/templates';
import { useController } from 'react-hook-form';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface TextBlockComponentProps {
  block: TextFormBlock;
}

export function TextBlockComponent(props: TextBlockComponentProps) {
  const { block } = props;
  const { field, fieldState } = useController({
    name: block.id,
  });

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{block.schema.label}</FieldLabel>
      <Input
        {...field}
        id={field.name}
        value={field.value ?? ''}
        placeholder={block.schema.placeholder ?? undefined}
        aria-invalid={fieldState.invalid}
      />
      {block.schema.description && (
        <FieldDescription>{block.schema.description}</FieldDescription>
      )}
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
