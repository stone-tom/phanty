import { createQueryKeys } from '@lukemorales/query-key-factory';
import type { TemplateType } from '@repo/templates';
import { api } from '@/lib/api';

export type TemplateListStatus = 'active' | 'archived' | 'all';

export const templates = createQueryKeys('templates', {
  get: (templateId: string) => ({
    queryKey: [templateId],
    queryFn: () => api.v1.templates({ id: templateId }).get(),
  }),
  list: (
    options: { type?: TemplateType; status?: TemplateListStatus } = {},
  ) => ({
    queryKey: [options],
    queryFn: () =>
      api.v1.templates.get({
        query: options,
      }),
  }),
});
