import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CircleAlert, GalleryVerticalEndIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import slugify from 'slugify';
import z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

export const Route = createFileRoute('/_auth/setup-org')({
  component: SetupOrg,
});

function SetupOrg() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<'form' | 'error'>('form');

  const handleSubmitOrgInfo = async (values: SetupOrgFormValues) => {
    const response = await api.v1.organizations.setup.post({
      slug: slugify(values.name),
      name: values.name,
    });

    if (response.error) {
      setViewState('error');
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        {viewState === 'form' && (
          <SetupOrgForm onSubmit={handleSubmitOrgInfo} />
        )}
        {viewState === 'error' && (
          <ErrorView onBackClick={() => navigate({ to: '/' })} />
        )}
      </div>
    </div>
  );
}

const setupOrgSchema = z.object({
  name: z.string().min(1, 'Please enter a workspace name'),
});

type SetupOrgFormValues = z.infer<typeof setupOrgSchema>;

interface SetupOrgFormProps {
  onSubmit: (values: SetupOrgFormValues) => void;
  defaultValues?: Partial<SetupOrgFormValues>;
}

function SetupOrgForm(props: SetupOrgFormProps) {
  const { defaultValues, onSubmit } = props;
  const form = useForm({
    resolver: zodResolver(setupOrgSchema),
    defaultValues: {
      name: '',
      ...defaultValues,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-8 items-center justify-center rounded-md">
          <GalleryVerticalEndIcon className="size-6" />
        </div>
        <span className="sr-only">phanty</span>
        <h1 className="text-xl font-bold">Set up your workspace</h1>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Workspace Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="phanty Inc."
                  aria-invalid={fieldState.invalid}
                  autoFocus
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Field>
            <Button type="submit">Continue</Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}

function ErrorView({ onBackClick }: { onBackClick: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-8 items-center justify-center rounded-md">
          <CircleAlert className="size-6" />
        </div>
        <span className="sr-only">phanty</span>
        <h1 className="text-xl font-bold">Oops, something went wrong</h1>
        <FieldDescription className="px-6 text-center">
          We are experiencing some issues at the moment.
          <br />
          <br />
          Please try again later. If the problem persists, contact our support
          team.
        </FieldDescription>
      </div>
      <Button variant="link" onClick={onBackClick}>
        Refresh page
      </Button>
    </div>
  );
}
