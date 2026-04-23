import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ContentBlockList } from './content-block-list';

export function BlockEditor() {
  return (
    <div className="h-full flex flex-col flex-1 min-h-0">
      <Tabs defaultValue="content" className="min-h-0 flex-1 gap-0">
        <div className="p-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Block Editor</h2>
          <Button type="button">Save</Button>
        </div>

        <div className="w-full px-3 pb-3 border-b">
          <TabsList className="w-full bg-primary/10 border-primary border">
            <TabsTrigger
              value="layout"
              className=" data-active:text-primary data-active:hover:text-primary  data-active:border-primary/60"
            >
              Layout
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className=" data-active:text-primary data-active:hover:text-primary  data-active:border-primary/60"
            >
              Content
            </TabsTrigger>
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
    </div>
  );
}
