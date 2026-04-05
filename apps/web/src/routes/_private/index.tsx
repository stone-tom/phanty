import { createFileRoute } from '@tanstack/react-router';
import { PageContent } from '@/components/page-content';
import { PageHeader } from '@/components/page-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';

export const Route = createFileRoute('/_private/')({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>Home</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeader>
      <PageContent>Welcome Home!</PageContent>
    </>
  );
}
