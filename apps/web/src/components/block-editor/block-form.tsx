import { memo } from 'react';
import { TextBlockForm } from './block-forms/form/text';
import { ContainerBlockForm } from './block-forms/layout/container';
import { useBlockEditorBlock } from './hooks';

interface BlockFormProps {
  blockId: string;
}

export const BlockForm = memo((props: BlockFormProps) => {
  const { blockId } = props;
  const type = useBlockEditorBlock(
    {
      id: blockId,
    },
    (block) => block.type,
  );

  switch (type) {
    case 'container': {
      return <ContainerBlockForm blockId={blockId} />;
    }
    case 'text': {
      return <TextBlockForm blockId={blockId} />;
    }
    default: {
      return (
        <div className="rounded-lg px-4 py-4 text-sm text-muted-foreground">
          No form available for this block type yet.
        </div>
      );
    }
  }
});

BlockForm.displayName = 'BlockForm';
