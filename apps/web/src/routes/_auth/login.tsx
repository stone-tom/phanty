import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { GalleryVerticalEndIcon } from 'lucide-react';
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

const searchParamSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
  validateSearch: searchParamSchema,
  staticData: {
    title: 'Welcome back',
    description: 'Login with your account',
  },
  beforeLoad: async ({ context, location }) => {
    if (context.authData) {
      throw redirect({
        to: searchParamSchema.parse(location.search).redirect || '/',
      });
    }
  },
});

const schema = z.object({
  email: z.email('Please enter a valid email for login'),
});

type LoginFormValues = z.infer<typeof schema>;

function LoginPage() {
  const handleLogin = async (values: LoginFormValues) => {
    console.log('login', values);
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <MagicLinkForm onSubmit={handleLogin} />
      </div>
    </div>
  );
}

interface MagicLinkFormProps {
  onSubmit: (values: LoginFormValues) => void;
  defaultValues?: Partial<LoginFormValues>;
}

function MagicLinkForm(props: MagicLinkFormProps) {
  const { defaultValues, onSubmit } = props;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      ...defaultValues,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEndIcon className="size-6" />
            </div>
            <span className="sr-only">phanty</span>
            <h1 className="text-xl font-bold">Log in to phanty</h1>
          </div>
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>E-Mail</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="ele@phanty.app"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Field>
            <Button type="submit">Continue with email</Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        Don&apos;t have an account? <a href="/sign-up">Sign up</a>
      </FieldDescription>
    </div>
  );
}
