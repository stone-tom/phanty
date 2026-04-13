import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageContent } from '@/components/page-content';
import { PageHeader } from '@/components/page-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useEdenMutation } from '@/hooks/use-eden-mutation';
import { useEdenQuery } from '@/hooks/use-eden-query';
import { api } from '@/lib/api';
import { projects } from '@/queries/projects';

export const Route = createFileRoute('/_private/projects')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, error } = useEdenQuery(projects.list);
  const queryClient = useQueryClient();

  const { mutate } = useEdenMutation(
    (input: { name: string }) => api.v1.projects.post(input),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: projects._def });
        console.log('Success trigger.');
      },
      onError: (error) => {
        console.log('Error trigger.', error);
      },
    },
  );

  const test = () => {
    mutate({ name: 'test' });
  };

  return (
    <>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>Projects</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeader>
      <PageContent>
        Hello "/_private/projects"! {data?.length} {error?.status}
        <ul>
          {data?.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
        <Button onClick={test}>create</Button>
      </PageContent>
    </>
  );
}
