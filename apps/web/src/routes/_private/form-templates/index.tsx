import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { type CellContext, createColumnHelper } from '@tanstack/react-table';
import {
  Archive,
  EditIcon,
  EllipsisVertical,
  PencilRuler,
  Plus,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageContent } from '@/components/page-content';
import { PageHeader } from '@/components/page-header';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { useEdenMutation } from '@/hooks/use-eden-mutation';
import { type EdenQueryData, useEdenQuery } from '@/hooks/use-eden-query';
import { useFormatDate } from '@/hooks/use-format-date';
import { api } from '@/lib/api';
import { formTemplates } from '@/queries/form-templates';
import { CreateFormTemplateAction } from './-components/create-form-template-action';
import { FormTemplatesTable } from './-components/form-templates-table';
import { UpdateFormTemplateAction } from './-components/update-form-template-action';

export const Route = createFileRoute('/_private/form-templates/')({
  component: FormTemplatesPage,
});

type FormTemplate = EdenQueryData<typeof formTemplates.list>[number];
const columnHelper = createColumnHelper<FormTemplate>();

function FormTemplatesPage() {
  const { data } = useEdenQuery(formTemplates.list('active'));
  const formatDate = useFormatDate();

  const [action, setAction] = useState<{
    type: 'update' | 'delete';
    target: FormTemplate;
  } | null>(null);

  const resetAction = () => setAction(null);

  const queryClient = useQueryClient();

  const { mutate: deleteFormTemplate, isPending: isDeletePending } =
    useEdenMutation(
      (formTemplateId: string) =>
        api.v1.forms.templates({ id: formTemplateId }).delete(),
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: formTemplates._def });
          toast.success('Form template archived');
          resetAction();
        },
        onError: () => {
          toast.error('Something went wrong');
        },
      },
    );

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
        cell: (props) => (
          <ActionCell
            {...props}
            onDeleteClick={(formTemplate) =>
              setAction({ type: 'delete', target: formTemplate })
            }
            onEditClick={(formTemplate) =>
              setAction({ type: 'update', target: formTemplate })
            }
          />
        ),
      }),
    ],
    [formatDate],
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Form templates</h1>
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

      <AlertDialog
        open={action?.type === 'delete'}
        onOpenChange={() => setAction(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete form template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive <strong>{action?.target?.name}</strong> and
              remove it from the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletePending}>
              Cancel
            </AlertDialogCancel>
            <LoadingButton
              type="button"
              variant="destructive"
              loading={isDeletePending}
              onClick={() => {
                if (!action?.target) {
                  return;
                }
                deleteFormTemplate(action.target.id);
              }}
            >
              Delete
            </LoadingButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={action?.type === 'update'} onOpenChange={resetAction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit form template</DialogTitle>
          </DialogHeader>
          {action?.target && (
            <UpdateFormTemplateAction
              formTemplate={action.target}
              onSuccess={resetAction}
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ActionCellProps extends CellContext<FormTemplate, unknown> {
  onDeleteClick: (formTemplate: FormTemplate) => void;
  onEditClick: (formTemplate: FormTemplate) => void;
}

function ActionCell(props: ActionCellProps) {
  const formTemplate = props.row.original;

  return (
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
          <DropdownMenuItem asChild>
            <Link
              to={`/form-templates/$id/editor`}
              params={{ id: formTemplate.id }}
            >
              <PencilRuler />
              Editor
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => props.onEditClick(formTemplate)}>
            <EditIcon />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => props.onDeleteClick(formTemplate)}>
            <Archive />
            Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
