import type { BlockEditorDocument } from '@repo/templates';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import isEqual from 'lodash/isEqual';
import { useState } from 'react';
import { toast } from 'sonner';
import { useStore } from 'zustand';
import { BlockEditor } from '@/components/block-editor/block-editor';
import { BlockEditorPreview } from '@/components/block-editor/block-editor-preview';
import {
  BlockEditorStoreContext,
  useCreateBlockEditorStore,
} from '@/components/block-editor/store';
import { PageHeader } from '@/components/page-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Skeleton } from '@/components/ui/skeleton';
import { useEdenMutation } from '@/hooks/use-eden-mutation';
import { useEdenQuery } from '@/hooks/use-eden-query';
import { api } from '@/lib/api';
import { templates } from '@/queries/templates';

export const Route = createFileRoute('/_private/form-templates/$id/editor')({
  component: FormTemplateEditorPage,
});

function FormTemplateEditorPage() {
  const { id: formTemplateId } = Route.useParams();
  const { data, isPending } = useEdenQuery(templates.get(formTemplateId));

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
      {data ? (
        <FormTemplateEditorContent
          key={formTemplateId}
          templateId={formTemplateId}
          initialDocument={data.document}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
          {isPending && (
            <>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="min-h-0 flex-1 w-full" />
            </>
          )}
        </div>
      )}
    </>
  );
}

interface FormTemplateEditorContentProps {
  templateId: string;
  initialDocument: BlockEditorDocument;
}

function FormTemplateEditorContent(props: FormTemplateEditorContentProps) {
  const { initialDocument, templateId } = props;
  const [savedDocument, setSavedDocument] = useState(() =>
    structuredClone(initialDocument),
  );
  const queryClient = useQueryClient();
  const store = useCreateBlockEditorStore(savedDocument);
  const document = useStore(store, (state) => state.document);
  const dirty = !isEqual(document, savedDocument);
  const { mutateAsync: saveDocument, isPending: isSaving } = useEdenMutation(
    (nextDocument: BlockEditorDocument) =>
      api.v1.templates({ id: templateId }).document.put({
        document: nextDocument,
      }),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: templates._def });
      },
    },
  );

  const handleSave = async () => {
    if (!dirty || isSaving) {
      return;
    }

    try {
      const updatedTemplate = await saveDocument(document);
      const nextSavedDocument = updatedTemplate.document;

      setSavedDocument(structuredClone(nextSavedDocument));
      store.getState().actions.replaceDocument(nextSavedDocument);
      toast.success('Changes saved');
    } catch {
      toast.error('Unable to save changes');
    }
  };

  return (
    <BlockEditorStoreContext value={store}>
      <div className="min-h-0 flex-1">
        <ResizablePanelGroup orientation="horizontal" className="min-h-0">
          <ResizablePanel
            defaultSize="30%"
            minSize={300}
            maxSize={500}
            className="overflow-hidden!"
          >
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex shrink-0 items-center justify-between p-3">
                <div>
                  <h2 className="text-lg font-semibold">Block Editor</h2>
                  {dirty ? (
                    <p className="text-sm text-muted-foreground">
                      Unsaved changes
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      All changes saved
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    void handleSave();
                  }}
                  disabled={!dirty || isSaving}
                >
                  {isSaving ? 'Saving...' : dirty ? 'Save' : 'Saved'}
                </Button>
              </div>
              <BlockEditor />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="70%" minSize={300}>
            <BlockEditorPreview />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </BlockEditorStoreContext>
  );
}
