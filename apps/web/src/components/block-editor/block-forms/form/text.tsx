import type { TextFieldSchema } from '@repo/templates';
import { debounce } from 'lodash';
import { useEffect, useRef } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { typedPick } from '@/util/type-helpers';
import { useBlockEditorActions, useBlockEditorBlock } from '../../hooks';

interface TextBlockFormProps {
  blockId: string;
}

export function TextBlockForm(props: TextBlockFormProps) {
  const { blockId } = props;
  const { updateBlock } = useBlockEditorActions();

  const formRef = useRef<HTMLFormElement>(null);
  const defaultValues = useBlockEditorBlock(
    {
      id: blockId,
      assertType: 'text',
    },
    useShallow((block) =>
      typedPick(block.schema, [
        'label',
        'description',
        'placeholder',
        'required',
      ]),
    ),
  );

  const form = useForm<TextFieldSchema>({
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

  // When component mounts, focus the label input and select its content for easy editing.
  // especially useful when adding a new text block, as the label will be pre-filled with a default value.
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
          updateBlock<'text'>(blockId, {
            schema: values,
          });
        })}
        className="space-y-6 p-3"
      >
        <FieldGroup>
          <Controller
            control={form.control}
            name="label"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Label</FieldLabel>
                <Input
                  {...field}
                  ref={autoFocusRef}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="placeholder"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Placeholder</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  Will be shown in the input when it's empty.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </FormProvider>
  );
}
