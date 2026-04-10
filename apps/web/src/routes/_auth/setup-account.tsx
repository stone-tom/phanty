import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CircleAlert, GalleryVerticalEndIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { authClient } from '@/lib/auth';

export const Route = createFileRoute('/_auth/setup-account')({
  component: SetupAccount,
});

function SetupAccount() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<'form' | 'error'>('form');

  const handleSubmitAccountInfo = async (values: SetupAccountFormValues) => {
    const response = await authClient.updateUser({
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
          <SetupAccountForm onSubmit={handleSubmitAccountInfo} />
        )}
        {viewState === 'error' && (
          <ErrorView onBackClick={() => navigate({ to: '/' })} />
        )}
      </div>
    </div>
  );
}

const setupAccountSchema = z.object({
  name: z.string().min(1, 'Please enter your name'),
});

type SetupAccountFormValues = z.infer<typeof setupAccountSchema>;

interface SetupAccountFormProps {
  onSubmit: (values: SetupAccountFormValues) => void;
  defaultValues?: Partial<SetupAccountFormValues>;
}

function SetupAccountForm(props: SetupAccountFormProps) {
  const { defaultValues, onSubmit } = props;
  const form = useForm({
    resolver: zodResolver(setupAccountSchema),
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
        <h1 className="text-xl font-bold">Set up your account</h1>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="John Doe"
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
