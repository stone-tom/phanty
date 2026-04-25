import { Field, FieldContent, FieldGroup, FieldLabel } from '../../../ui/field';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { useBlockEditorActions, useBlockEditorBlock } from '../../hooks';

interface TextBlockFormProps {
  id: string;
}

export function TextBlockForm(props: TextBlockFormProps) {
  const block = useBlockEditorBlock({ id: props.id, assertType: 'text' });
  const { updateBlock } = useBlockEditorActions();

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor={`${block.id}-label`}>Label</FieldLabel>
        <FieldContent>
          <Input
            id={`${block.id}-label`}
            value={block.schema.label}
            onChange={(event) => {
              updateBlock(block.id, {
                schema: {
                  ...block.schema,
                  label: event.target.value,
                },
              });
            }}
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${block.id}-name`}>Name</FieldLabel>
        <FieldContent>
          <Input
            id={`${block.id}-name`}
            value={block.schema.name}
            onChange={(event) => {
              updateBlock(block.id, {
                schema: {
                  ...block.schema,
                  name: event.target.value,
                },
              });
            }}
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${block.id}-description`}>Description</FieldLabel>
        <FieldContent>
          <Textarea
            id={`${block.id}-description`}
            value={block.schema.description ?? ''}
            onChange={(event) => {
              updateBlock(block.id, {
                schema: {
                  ...block.schema,
                  description: event.target.value || undefined,
                },
              });
            }}
          />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${block.id}-placeholder`}>Placeholder</FieldLabel>
        <FieldContent>
          <Input
            id={`${block.id}-placeholder`}
            value={block.schema.placeholder ?? ''}
            onChange={(event) => {
              updateBlock(block.id, {
                schema: {
                  ...block.schema,
                  placeholder: event.target.value || undefined,
                },
              });
            }}
          />
        </FieldContent>
      </Field>

      <Label
        htmlFor={`${block.id}-required`}
        className="flex items-center gap-3 rounded-lg border border-border px-3 py-3"
      >
        <input
          id={`${block.id}-required`}
          type="checkbox"
          className="size-4 accent-current"
          checked={block.schema.required ?? false}
          onChange={(event) => {
            updateBlock(block.id, {
              schema: {
                ...block.schema,
                required: event.target.checked || undefined,
              },
            });
          }}
        />
        Required field
      </Label>
    </FieldGroup>
  );
}
