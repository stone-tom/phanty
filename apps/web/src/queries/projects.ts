import { api } from '@/lib/api';
// import { unwrapEdenResponse } from '@/util/unwrap-eden-response';
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const projects = createQueryKeys('projects', {
  get: (projectId: string) => ({
    queryKey: [projectId],
    queryFn: () => api.v1.projects({ id: projectId }).get(),
  }),
  list: {
    queryKey: null,
    queryFn: () => api.v1.projects.get(),
  }
});