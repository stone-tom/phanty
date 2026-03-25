import { createQueryKeys } from '@lukemorales/query-key-factory';
import { api } from '@/lib/api';

export const projects = createQueryKeys('projects', {
  get: (projectId: string) => ({
    queryKey: [projectId],
    queryFn: () => api.v1.projects({ id: projectId }).get(),
  }),
  list: {
    queryKey: null,
    queryFn: () => api.v1.projects.get(),
  },
});
