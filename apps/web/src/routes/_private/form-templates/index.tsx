import { createFileRoute } from '@tanstack/react-router';
import { type CellContext, createColumnHelper } from '@tanstack/react-table';
import { EditIcon, EllipsisVertical, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { PageContent } from '@/components/page-content';
import { PageHeader } from '@/components/page-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingButton } from '@/components/ui/loading-button';
import { useBooleanState } from '@/hooks/use-boolean-state';
import { type EdenQueryData, useEdenQuery } from '@/hooks/use-eden-query';
import { useFormatDate } from '@/hooks/use-format-date';
import { formTemplates } from '@/queries/form-templates';
import { CreateFormTemplateAction } from './-components/create-form-template-action';
import { FormTemplatesTable } from './-components/form-templates-table';
import { UpdateFormTemplateAction } from './-components/update-form-template-action';

export const Route = createFileRoute('/_private/form-templates/')({
  component: FormTemplatesPage,
});

type FormTemplate = EdenQueryData<typeof formTemplates.list>[number];

function FormTemplatesPage() {
  const { data } = useEdenQuery(formTemplates.list('all'));
  const formatDate = useFormatDate();

  const columnHelper = createColumnHelper<FormTemplate>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: () => 'Name',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('description', {
        header: () => 'Description',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('createdBy.user.name', {
        header: () => 'Created By',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('createdAt', {
        header: () => 'Created At',
        cell: (info) => formatDate(info.getValue(), 'datetime'),
      }),
      columnHelper.accessor('updatedAt', {
        header: () => 'Updated At',
        cell: (info) => formatDate(info.getValue(), 'datetime'),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ActionCell,
      }),
    ],
    [columnHelper, formatDate],
  );

  const [isCreateDialogOpen, openCreateDialog, closeCreateDialog] =
    useBooleanState();

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
      <PageContent>
        <div className="flex items-center justify-between mt-1 mb-2">
          <h1 className="text-xl font-semibold mt-1 mb-2">Form templates</h1>
          <Button type="button" onClick={openCreateDialog}>
            <Plus />
            Create form template
          </Button>
        </div>
        <FormTemplatesTable
          columns={columns}
          data={data ?? []}
          initialState={{
            columnPinning: {
              right: ['actions'],
            },
          }}
        />
      </PageContent>
      <Dialog open={isCreateDialogOpen} onOpenChange={closeCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create form template</DialogTitle>
          </DialogHeader>
          <CreateFormTemplateAction onSuccess={closeCreateDialog}>
            {({ formId, isPending }) => (
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <LoadingButton type="submit" form={formId} loading={isPending}>
                  Create
                </LoadingButton>
              </DialogFooter>
            )}
          </CreateFormTemplateAction>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ActionCell(props: CellContext<FormTemplate, unknown>) {
  const formTemplate = props.row.original;
  const [isUpdateDialogOpen, openUpdateDialog, closeUpdateDialog] =
    useBooleanState();

  return (
    <>
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="icon-sm">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openUpdateDialog}>
              <EditIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isUpdateDialogOpen && (
        <Dialog open={isUpdateDialogOpen} onOpenChange={closeUpdateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit form template</DialogTitle>
            </DialogHeader>
            <UpdateFormTemplateAction
              formTemplate={formTemplate}
              onSuccess={closeUpdateDialog}
            >
              {({ formId, isPending }) => (
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" disabled={isPending}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <LoadingButton
                    type="submit"
                    form={formId}
                    loading={isPending}
                  >
                    Update
                  </LoadingButton>
                </DialogFooter>
              )}
            </UpdateFormTemplateAction>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
