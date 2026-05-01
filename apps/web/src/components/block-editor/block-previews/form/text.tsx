import type { AnyBlock } from '@repo/templates';
import { useShallow } from 'zustand/react/shallow';
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
    })),
  );

  const title = blockPreview.label.trim() || 'Untitled text field';

  return (
    <div className="flex flex-col min-h-12 justify-center">
      <span className="capitalize truncate font-semibold">
        {blockPreview.type} field
      </span>
      <span className="truncate ">{title}</span>
    </div>
  );
}
