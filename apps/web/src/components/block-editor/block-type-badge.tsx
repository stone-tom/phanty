import type { BlockType } from '@repo/templates';
import { Badge } from '../ui/badge';
import { blockIcon } from './block-icon';

interface BlockTypeBadgeProps {
  type: BlockType;
}

export function BlockTypeBadge(props: BlockTypeBadgeProps) {
  const { type } = props;

  const Icon = blockIcon[type];

  return (
    <Badge variant="secondary" className="bg-primary-soft">
      <Icon />
      <span className="capitalize">{type}</span>
    </Badge>
  );
}
