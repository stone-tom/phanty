import { Field, FieldContent, FieldGroup, FieldLabel } from '../../../ui/field';
import { Input } from '../../../ui/input';
import { useBlockEditorBlock, useBlockEditorState } from '../../hooks';
import { getChildBlocks } from '../../ordering';

interface ContainerBlockFormProps {
  id: string;
}

export function ContainerBlockForm(props: ContainerBlockFormProps) {
  const block = useBlockEditorBlock({ id: props.id, assertType: 'container' });
  const childCount = useBlockEditorState(
    (state) => getChildBlocks(state.document.blocks, block.id).length,
  );

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Type</FieldLabel>
        <FieldContent>
          <Input value={block.type} readOnly />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>Block Id</FieldLabel>
        <FieldContent>
          <Input value={block.id} readOnly />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>Child Blocks</FieldLabel>
        <FieldContent>
          <Input value={String(childCount)} readOnly />
        </FieldContent>
      </Field>

      <div className="rounded-lg border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
        Container blocks are structural right now, so there are no editable
        fields yet.
      </div>
    </FieldGroup>
  );
}
