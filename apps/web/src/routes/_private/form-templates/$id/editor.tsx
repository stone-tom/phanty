import { createFileRoute, Link } from '@tanstack/react-router';
import { BlockEditor } from '@/components/block-editor/block-editor';
import { PageContent } from '@/components/page-content';
import { PageHeader } from '@/components/page-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const Route = createFileRoute('/_private/form-templates/$id/editor')({
  component: FormTemplateEditorPage,
});

function FormTemplateEditorPage() {
  return (
    <>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/form-templates">Form Templates</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>NAME - Editor</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeader>
      <PageContent>
        <BlockEditor />
      </PageContent>
    </>
  );
}
