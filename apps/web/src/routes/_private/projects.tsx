import { createFileRoute } from '@tanstack/react-router';
import { useEdenQuery } from '@/hooks/use-eden-query';
import { projects } from '@/queries/projects';

export const Route = createFileRoute('/_private/projects')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, error } = useEdenQuery(projects.get('test'));

  return (
    <div>
      Hello "/_private/projects"! {data?.name} {error?.status}
    </div>
  );
}
