import type { AnyBlock } from '@repo/templates';
import { useShallow } from 'zustand/react/shallow';
import { BlockTypeBadge } from '../../block-type-badge';
import { useBlockEditorBlock } from '../../hooks';

interface TextBlockPreviewProps {
  blockId: AnyBlock['id'];
}

export function TextBlockPreview(props: TextBlockPreviewProps) {
  const blockPreview = useBlockEditorBlock(
    {
      id: props.blockId,
      assertType: 'text',
    },
    useShallow((block) => ({
      type: block.type,
      label: block.schema.label,
      schema: block.schema,
    })),
  );

  const title = blockPreview.label.trim() || 'Untitled text field';
  const description =
    blockPreview.schema.description?.trim() || 'No description provided';

  return (
    <div className="flex flex-col min-h-12 gap-1 justify-center">
      <div className="flex items-center gap-2">
        <span className="truncate font-semibold">{title}</span>
        <BlockTypeBadge type={blockPreview.type} />
      </div>
      <span className="truncate text-muted-foreground">{description}</span>
    </div>
  );
}
