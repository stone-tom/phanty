import { createFileRoute } from '@tanstack/react-router';
import { authClient } from '@/lib/auth';
import { api } from '@/lib/api';
import { keys, mapKeys, toPath } from 'lodash';

export const Route = createFileRoute('/_private/projects')({
  component: RouteComponent,
});

function RouteComponent() {
  const activeOrganization = authClient.useActiveOrganization();
  return <div>Hello "/_private/projects"!</div>;
}
