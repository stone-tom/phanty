import { BlockRenderer } from '../block-renderer/block-renderer';
import { useBlockEditorState } from './hooks';

export function BlockEditorPreview() {
  const blocks = useBlockEditorState((state) => state.document.blocks);

  return (
    <div className="h-full overflow-auto bg-muted/30 p-6">
      <BlockRenderer blocks={blocks} />
    </div>
  );
}
