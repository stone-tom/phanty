import { createFileRoute } from '@tanstack/react-router';
import { authClient } from '@/lib/auth';

export const Route = createFileRoute('/_private/projects')({
  component: RouteComponent,
});

function RouteComponent() {
  const activeOrganization = authClient.useActiveOrganization();
  console.log(activeOrganization);
  return <div>Hello "/_private/projects"!</div>;
}
