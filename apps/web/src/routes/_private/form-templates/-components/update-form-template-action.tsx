import { useQueryClient } from '@tanstack/react-query';
import { useId } from 'react';
import { toast } from 'sonner';
import type { ActionChildrenProps } from '@/components/actions/types';
import { useEdenMutation } from '@/hooks/use-eden-mutation';
import type { EdenQueryData } from '@/hooks/use-eden-query';
import { api } from '@/lib/api';
import { templates } from '@/queries/templates';
import {
  FormTemplateForm,
  type FormTemplateFormValues,
} from './form-template-form';

type FormTemplate = EdenQueryData<typeof templates.list>[number];

interface UpdateFormTemplateActionProps extends ActionChildrenProps {
  formTemplate: FormTemplate;
  onSuccess?: () => void;
}

export function UpdateFormTemplateAction(props: UpdateFormTemplateActionProps) {
  const formId = useId();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useEdenMutation(
    (values: FormTemplateFormValues) =>
      api.v1.templates({ id: props.formTemplate.id }).put(values),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: templates._def });
        toast.success('Form template updated');
        props.onSuccess?.();
      },
      onError: () => {
        toast.error('Something went wrong');
      },
    },
  );

  return (
    <>
      <FormTemplateForm
        formId={formId}
        onSubmit={mutate}
        defaultValues={{
          name: props.formTemplate.name,
          description: props.formTemplate.description ?? '',
        }}
      />
      {props.children({
        formId,
        isPending,
      })}
    </>
  );
}
