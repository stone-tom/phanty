import { ArrowLeft } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ContentBlockList } from './content-block-list';
import { useBlockEditorActions, useBlockEditorState } from './hooks';
import { LayoutBlockList } from './layout-block-list';

const editorTabs = ['layout', 'content'] as const;

export function BlockEditor() {
  const selectedBlockId = useBlockEditorState((state) => state.selectedBlockId);
  const { selectBlock } = useBlockEditorActions();
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringLiteral(editorTabs).withDefault('content'),
  );

  return (
    <div className="h-full flex flex-col flex-1 min-h-0">
      <div className="p-3 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Block Editor</h2>
        <Button type="button">Save</Button>
      </div>

      {selectedBlockId ? (
        <div className="px-3 pb-3 border-b">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => selectBlock(null)}
          >
            <ArrowLeft />
            Back
          </Button>
        </div>
      ) : (
        <Tabs
          value={tab}
          onValueChange={(nextValue) => {
            void setTab(nextValue as (typeof editorTabs)[number]);
          }}
          className="min-h-0 flex-1 gap-0"
        >
          <div className="w-full px-3 pb-3 border-b">
            <TabsList className="w-full">
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
          </div>

          <div className="w-full min-h-0 flex-1 flex flex-col pr-0.5">
            <ScrollArea className="w-full min-h-0 flex-1 pl-3 pr-2.5">
              <TabsContent value="layout" className="py-3">
                <LayoutBlockList />
              </TabsContent>
              <TabsContent value="content" className="py-3">
                <ContentBlockList />
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      )}
    </div>
  );
}
