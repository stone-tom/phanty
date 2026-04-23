import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ContentBlockList } from './content-block-list';
import { useBlockEditorActions, useBlockEditorState } from './hooks';

export function BlockEditor() {
  const selectedBlock = useBlockEditorState((state) => state.selectedBlock);
  const { selectBlock } = useBlockEditorActions();

  return (
    <div className="h-full flex flex-col flex-1 min-h-0">
      <div className="p-3 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Block Editor</h2>
        <Button type="button">Save</Button>
      </div>

      {selectedBlock ? (
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
        <Tabs defaultValue="content" className="min-h-0 flex-1 gap-0">
          <div className="w-full px-3 pb-3 border-b">
            <TabsList className="w-full">
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
          </div>

          <div className="w-full min-h-0 flex-1 flex flex-col pr-0.5">
            <ScrollArea className="w-full min-h-0 flex-1 pl-3 pr-2.5">
              <TabsContent value="layout" className="py-3">
                Layout TBA
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
