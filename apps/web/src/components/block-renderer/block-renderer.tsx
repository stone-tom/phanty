import { getChildBlocks, getRootBlocks } from '../block-editor/ordering';
import {
  type AnyBlock,
  type BlockEditorDocument,
  isLeafBlock,
} from '../block-editor/types';

interface BlockRendererProps {
  blocks: BlockEditorDocument['blocks'];
}

export function BlockRenderer(props: BlockRendererProps) {
  const { blocks } = props;
  const rootBlocks = getRootBlocks(blocks);

  return (
    <div className="flex flex-col gap-6">
      {rootBlocks.map((rootBlock) => (
        <RenderedRootBlock
          key={rootBlock.id}
          block={rootBlock}
          blocks={blocks}
        />
      ))}
    </div>
  );
}

interface RenderedRootBlockProps {
  block: Extract<AnyBlock, { parentId: null }>;
  blocks: BlockEditorDocument['blocks'];
}

function RenderedRootBlock(props: RenderedRootBlockProps) {
  const { block, blocks } = props;
  const childBlocks = getChildBlocks(blocks, block.id).filter(isLeafBlock);

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <header className="border-b border-border px-4 py-3">
        <p className="text-sm font-semibold capitalize text-foreground">
          {block.type}
        </p>
        <p className="text-xs text-muted-foreground">{block.id}</p>
      </header>

      <div className="flex flex-col gap-3 p-4">
        {childBlocks.length > 0 ? (
          childBlocks.map((childBlock) => (
            <RenderedChildBlock key={childBlock.id} block={childBlock} />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            Empty container
          </div>
        )}
      </div>
    </section>
  );
}

interface RenderedChildBlockProps {
  block: Exclude<AnyBlock, { parentId: null }>;
}

function RenderedChildBlock(props: RenderedChildBlockProps) {
  const { block } = props;

  switch (block.type) {
    case 'text':
      return (
        <div className="rounded-lg border border-border bg-background px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            {block.schema.label}
          </p>
          <p className="text-xs text-muted-foreground">{block.schema.name}</p>
          {block.schema.description ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {block.schema.description}
            </p>
          ) : null}
          {block.schema.placeholder ? (
            <div className="mt-3 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {block.schema.placeholder}
            </div>
          ) : null}
        </div>
      );

    default:
      return (
        <div className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          Unsupported block type: {block.type}
        </div>
      );
  }
}
