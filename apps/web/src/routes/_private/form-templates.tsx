import { createFileRoute } from '@tanstack/react-router';
import { PageContent } from '@/components/page-content';
import { PageHeader } from '@/components/page-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';

export const Route = createFileRoute('/_private/form-templates')({
  component: FormTemplatesPage,
});

function FormTemplatesPage() {
  return (
    <>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>Form Templates</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeader>
      <PageContent>TBA: Form templates CRUD</PageContent>
    </>
  );
}
