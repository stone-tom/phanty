import { createQueryKeys } from '@lukemorales/query-key-factory';
import type { BlockCategory } from '@repo/templates';
import { api } from '@/lib/api';

export const blocks = createQueryKeys('blocks', {
  list: (options: { category?: BlockCategory } = {}) => ({
    queryKey: [options],
    queryFn: () => api.v1.blocks.get({ query: options }),
  }),
});
