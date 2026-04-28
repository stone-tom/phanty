import { createFileRoute, Link } from '@tanstack/react-router';
import isEqual from 'lodash/isEqual';
import { useState } from 'react';
import { toast } from 'sonner';
import { useStore } from 'zustand';
import { BlockEditor } from '@/components/block-editor/block-editor';
import { BlockEditorPreview } from '@/components/block-editor/block-editor-preview';
import {
  type BlockEditorStorageParams,
  loadBlockEditorDocument,
  saveBlockEditorDocument,
} from '@/components/block-editor/block-editor-storage';
import {
  BlockEditorStoreContext,
  useCreateBlockEditorStore,
} from '@/components/block-editor/store';
import type { BlockEditorDocument } from '@/components/block-editor/types';
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
import { useEdenQuery } from '@/hooks/use-eden-query';
import { formTemplates } from '@/queries/form-templates';
import { largeEditorDocument } from './large-editor-document';

export const Route = createFileRoute('/_private/form-templates/$id/editor')({
  component: FormTemplateEditorPage,
});

type LocalSaveState = 'idle' | 'saving';

function FormTemplateEditorPage() {
  const { id: formTemplateId } = Route.useParams();
  const { data, isPending } = useEdenQuery(formTemplates.get(formTemplateId));

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
      <FormTemplateEditorContent
        key={formTemplateId}
        templateId={formTemplateId}
      />
    </>
  );
}

interface FormTemplateEditorContentProps {
  templateId: string;
}

function FormTemplateEditorContent(props: FormTemplateEditorContentProps) {
  const { templateId } = props;
  const [savedDocument, setSavedDocument] = useState(() =>
    getInitialDocument({
      templateId,
      templateType: largeEditorDocument.templateType,
    }),
  );
  const [saveState, setSaveState] = useState<LocalSaveState>('idle');
  const store = useCreateBlockEditorStore(savedDocument);
  const document = useStore(store, (state) => state.document);
  const dirty = !isEqual(document, savedDocument);

  const handleSave = async () => {
    if (!dirty || saveState === 'saving') {
      return;
    }

    setSaveState('saving');

    try {
      saveBlockEditorDocument(
        {
          templateId,
          templateType: document.templateType,
        },
        document,
      );
      setSavedDocument(structuredClone(document));
      setSaveState('idle');
      toast.success('Changes saved locally');
    } catch {
      setSaveState('idle');
      toast.error('Unable to save changes locally');
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
                  disabled={!dirty || saveState === 'saving'}
                >
                  {saveState === 'saving'
                    ? 'Saving...'
                    : dirty
                      ? 'Save'
                      : 'Saved'}
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

function getInitialDocument(
  storageParams: BlockEditorStorageParams,
): BlockEditorDocument {
  return (
    loadBlockEditorDocument(storageParams) ?? {
      ...largeEditorDocument,
      blocks: {
        ...largeEditorDocument.blocks,
        'container-empty': {
          id: 'container-empty',
          category: 'layout',
          type: 'container',
          parentId: null,
          sortIndex: 0,
        },
      },
    }
  );
}
