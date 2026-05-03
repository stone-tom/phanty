import { type BlockDefinition, getBlockVersionKey } from '@repo/templates';
import { useEdenQuery } from '@/hooks/use-eden-query';
import { blocks } from '@/queries/blocks';
import { AutoFillGrid } from '../ui/auto-fill-grid';
import { Button } from '../ui/button';
import { blockIcon } from './block-icon';

interface BlockSelectorProps {
  blockDefinitions: BlockDefinition[];
  onSelect: (selectedBlock: BlockDefinition) => void;
}

export function BlockSelector({
  blockDefinitions,
  onSelect,
}: BlockSelectorProps) {
  return (
    <AutoFillGrid columnMinWidth="80px" maxColumns={4}>
      {blockDefinitions.map((block) => {
        const Icon = blockIcon[block.type];
        return (
          <Button
            key={getBlockVersionKey(block.category, block.type, block.version)}
            type="button"
            variant="outline"
            onClick={() => onSelect(block)}
            className="w-full h-full aspect-square flex flex-col gap-2"
          >
            <Icon />
            {block.name}
          </Button>
        );
      })}
    </AutoFillGrid>
  );
}

interface ChildBlockSelectorProps {
  onSelect: (selectedBlock: BlockDefinition) => void;
}

export function ChildBlockSelector(props: ChildBlockSelectorProps) {
  const { data } = useEdenQuery(blocks.list({ category: 'form' }));
  return <BlockSelector blockDefinitions={data ?? []} {...props} />;
}

export function RootBlockSelector(props: ChildBlockSelectorProps) {
  const { data } = useEdenQuery(blocks.list({ category: 'layout' }));
  return <BlockSelector blockDefinitions={data ?? []} {...props} />;
}
