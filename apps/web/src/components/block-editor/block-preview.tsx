import type { AnyBlock } from '@repo/templates';
import { memo } from 'react';
import { TextBlockPreview } from './block-previews/form/text';
import { ContainerBlockPreview } from './block-previews/layout/container';
import { useBlockEditorBlock } from './hooks';

interface BlockPreviewProps {
  blockId: AnyBlock['id'];
}

export const BlockPreview = memo((props: BlockPreviewProps) => {
  const { blockId } = props;
  const type = useBlockEditorBlock(
    {
      id: blockId,
    },
    (block) => block.type,
  );

  switch (type) {
    case 'container': {
      return <ContainerBlockPreview blockId={blockId} />;
    }
    case 'text': {
      return <TextBlockPreview blockId={blockId} />;
    }
    default: {
      return (
        <div className="min-w-0 text-sm text-muted-foreground">
          No preview available for this block type yet.
        </div>
      );
    }
  }
});

BlockPreview.displayName = 'BlockPreview';
