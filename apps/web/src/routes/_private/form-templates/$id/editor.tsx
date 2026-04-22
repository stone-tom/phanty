import { createFileRoute, Link } from '@tanstack/react-router';
import { BlockEditor } from '@/components/block-editor/block-editor';
import {
  BlockEditorStoreContext,
  useCreateBlockEditorStore,
} from '@/components/block-editor/store';
import { PageContent } from '@/components/page-content';
import { PageHeader } from '@/components/page-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Skeleton } from '@/components/ui/skeleton';
import { useEdenQuery } from '@/hooks/use-eden-query';
import { formTemplates } from '@/queries/form-templates';
import { largeEditorDocument } from './large-editor-document';

export const Route = createFileRoute('/_private/form-templates/$id/editor')({
  component: FormTemplateEditorPage,
});

function FormTemplateEditorPage() {
  const { id: formTemplateId } = Route.useParams();
  const { data, isPending } = useEdenQuery(formTemplates.get(formTemplateId));

  const store = useCreateBlockEditorStore({
    ...largeEditorDocument,
    blocks: {
      ...largeEditorDocument.blocks,
      'container-empty': {
        id: `container-empty`,
        category: 'layout',
        type: 'container',
        parentId: null,
        sortIndex: 0,
      },
    },
  });

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
            <BreadcrumbItem>
              {isPending || !data ? (
                <Skeleton className="w-42 h-5" />
              ) : (
                `${data.name} - Editor`
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeader>
      <PageContent>
        <BlockEditorStoreContext value={store}>
          <ResizablePanelGroup
            orientation="horizontal"
            className="rounded-lg border"
          >
            <ResizablePanel defaultSize="30%" minSize={300} maxSize={500}>
              <BlockEditor />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="70%" minSize={300}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">Preview</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </BlockEditorStoreContext>
      </PageContent>
    </>
  );
}
