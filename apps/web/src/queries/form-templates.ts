import { createQueryKeys } from '@lukemorales/query-key-factory';
import { api } from '@/lib/api';

export type FormTemplateListStatus = 'active' | 'archived' | 'all';

export const formTemplates = createQueryKeys('form-templates', {
  get: (templateId: string) => ({
    queryKey: [templateId],
    queryFn: () => api.v1.forms.templates({ id: templateId }).get(),
  }),
  list: (status: FormTemplateListStatus = 'active') => ({
    queryKey: [status],
    queryFn: () =>
      api.v1.forms.templates.get({
        query: {
          status,
        },
      }),
  }),
});
