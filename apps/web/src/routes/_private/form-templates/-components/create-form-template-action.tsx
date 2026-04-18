import { useQueryClient } from '@tanstack/react-query';
import { useId } from 'react';
import { toast } from 'sonner';
import type { ActionChildrenProps } from '@/components/actions/types';
import { useEdenMutation } from '@/hooks/use-eden-mutation';
import { api } from '@/lib/api';
import { formTemplates } from '@/queries/form-templates';
import {
  FormTemplateForm,
  type FormTemplateFormValues,
} from './form-template-form';

interface CreateFormTemplateActionProps extends ActionChildrenProps {
  onSuccess?: () => void;
}

export function CreateFormTemplateAction(props: CreateFormTemplateActionProps) {
  const formId = useId();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useEdenMutation(
    (values: FormTemplateFormValues) => api.v1.forms.templates.post(values),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: formTemplates._def });
        toast.success('Form template created');
        props.onSuccess?.();
      },
      onError: () => {
        toast.error('Something went wrong');
      },
    },
  );

  return (
    <>
      <FormTemplateForm formId={formId} onSubmit={mutate} />
      {props.children({
        formId,
        isPending,
      })}
    </>
  );
}
