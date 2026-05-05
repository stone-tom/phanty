import { debounce } from 'lodash';
import { useEffect, useRef } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useBlockEditorActions, useBlockEditorBlock } from '../../hooks';

interface ContainerBlockFormProps {
  blockId: string;
}

interface ContainerBlockFormValues {
  name: string;
}

export function ContainerBlockForm(props: ContainerBlockFormProps) {
  const { blockId } = props;
  const { updateBlock } = useBlockEditorActions();
  const formRef = useRef<HTMLFormElement>(null);
  const defaultValues = useBlockEditorBlock(
    { id: blockId, assertType: 'container' },
    useShallow((block) => ({ name: block.name ?? '' })),
  );

  const form = useForm<ContainerBlockFormValues>({
    defaultValues,
    mode: 'onChange',
  });

  const { subscribe, handleSubmit } = form;

  useEffect(() => {
    return subscribe({
      formState: { values: true },
      callback: debounce(() => formRef.current?.requestSubmit(), 250, {
        leading: false,
        trailing: true,
      }),
    });
  }, [subscribe]);

  // When component mounts, focus the name input and select its content for easy editing.
  const autoFocusRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocusRef.current) {
      autoFocusRef.current.focus();
      autoFocusRef.current.select();
    }
  }, []);

  return (
    <FormProvider {...form}>
      <form
        ref={formRef}
        onSubmit={handleSubmit((values) => {
          updateBlock<'container'>(blockId, {
            name: values.name.trim(),
          });
        })}
        className="p-3"
      >
        <FieldGroup>
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  {...field}
                  ref={autoFocusRef}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </FormProvider>
  );
}
