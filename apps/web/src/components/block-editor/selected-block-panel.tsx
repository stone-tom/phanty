import { Separator } from '../ui/separator';
import { TextBlockForm } from './blockForms/form/text';
import { ContainerBlockForm } from './blockForms/layout/container';
import { useBlockEditorBlock, useBlockEditorState } from './hooks';

export function SelectedBlockPanel() {
  const selectedBlockId = useBlockEditorState((state) => state.selectedBlockId);

  if (!selectedBlockId) {
    return null;
  }

  return <SelectedBlockContent id={selectedBlockId} />;
}

interface SelectedBlockContentProps {
  id: string;
}

function SelectedBlockContent(props: SelectedBlockContentProps) {
  const block = useBlockEditorBlock({ id: props.id });

  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <div className="px-3 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {block.category} block
        </p>
        <h3 className="mt-1 text-base font-semibold capitalize">
          {block.type}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{block.id}</p>
      </div>
      <Separator />
      <div className="min-h-0 overflow-auto px-3 py-4">
        {(() => {
          switch (block.type) {
            case 'container':
              return <ContainerBlockForm id={block.id} />;
            case 'text':
              return <TextBlockForm id={block.id} />;
            default:
              return (
                <div className="rounded-lg border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
                  No form available for this block type yet.
                </div>
              );
          }
        })()}
      </div>
    </div>
  );
}
