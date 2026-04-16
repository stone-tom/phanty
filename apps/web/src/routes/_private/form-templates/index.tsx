import { createFileRoute } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMemo } from 'react';
import { EditIcon, EllipsisVertical, Trash2 } from 'lucide-react';
import { PageContent } from '@/components/page-content';
import { PageHeader } from '@/components/page-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { type EdenQueryData, useEdenQuery } from '@/hooks/use-eden-query';
import { useFormatDate } from '@/hooks/use-format-date';
import { formTemplates } from '@/queries/form-templates';
import { FormTemplatesTable } from './-components/form-templates-table';

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
        size: 64,
        minSize: 64,
        maxSize: 64,
        cell: () => {
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="icon">
                    <EllipsisVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
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
          );
        },
      }),
    ],
    [columnHelper, formatDate],
  );

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
        <h1 className="text-xl font-semibold mt-1 mb-2">Form templates</h1>
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
    </>
  );
}
