import type { AnyBlock } from '@repo/templates';
import { useShallow } from 'zustand/react/shallow';
import { useBlockEditorState } from '../../hooks';
import { getChildBlocks } from '../../ordering';

interface ContainerBlockPreviewProps {
  blockId: AnyBlock['id'];
}

export function ContainerBlockPreview(props: ContainerBlockPreviewProps) {
  const blockPreview = useBlockEditorState(
    useShallow((state) => {
      const block = state.document.blocks[props.blockId];

      if (!block || block.type !== 'container') {
        throw new Error(`Container block "${props.blockId}" not found`);
      }

      return {
        name: block.name,
        childCount: getChildBlocks(state.document.blocks, block.id).length,
      };
    }),
  );

  const title = blockPreview.name?.trim() || 'Container';
  const contentBlockLabel =
    blockPreview.childCount === 1
      ? '1 content block'
      : `${blockPreview.childCount} content blocks`;

  return (
    <div className="flex min-h-12 flex-col justify-center gap-1">
      <span className="truncate font-semibold">{title}</span>
      <span className="truncate text-muted-foreground">
        {contentBlockLabel}
      </span>
    </div>
  );
}
