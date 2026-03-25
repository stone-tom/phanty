import { createFileRoute } from '@tanstack/react-router';
import { authClient } from '@/lib/auth';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query'
import { keys, mapKeys, toPath } from 'lodash';
import { projects } from '@/queries/projects';
import { EdenApiError, useEdenQuery } from '@/util/unwrap-eden-response';

export const Route = createFileRoute('/_private/projects')({
  component: RouteComponent,
});

function RouteComponent() {
  const activeOrganization = authClient.useActiveOrganization();
  const { data, error } = useEdenQuery(projects.list);


  return <div>Hello "/_private/projects"! {data?.length} {error?.message}</div>;
}
