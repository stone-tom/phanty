import { useEdenQuery } from '@/hooks/use-eden-query';
import { blocks } from '@/queries/blocks';

export function SelectContentBlockAction() {
  const { data } = useEdenQuery(blocks.list());
  console.log('data', data);

  return (
    <div>
      {data?.map((block) => (
        <div key={block.id}>{block.name}</div>
      ))}
    </div>
  );
}
