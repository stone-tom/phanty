import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useEdenQuery } from '@/hooks/use-eden-query';
import { api } from '@/lib/api';
import { projects } from '@/queries/projects';

export const Route = createFileRoute('/_private/projects')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, error } = useEdenQuery(projects.list);
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (input: { name: string }) => api.v1.projects.post(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projects._def });
    },
  });

  const test = () => {
    mutate({ name: 'test' });
  };

  return (
    <div>
      Hello "/_private/projects"! {data?.length} {error?.status}
      <ul>
        {data?.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <Button onClick={test}>create</Button>
    </div>
  );
}
