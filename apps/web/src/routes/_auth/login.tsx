import { zodResolver } from '@hookform/resolvers/zod';
import {
  createFileRoute,
  redirect,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { CircleAlert, GalleryVerticalEndIcon, MailCheck } from 'lucide-react';
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
import { LoadingButton } from '@/components/ui/loading-button';
import { env } from '@/env';
import { authClient } from '@/lib/auth';

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

function buildCallbackURL(extension?: string) {
  const appBaseURL = new URL(env.VITE_BASE_URL);

  if (!extension) {
    return new URL('/', appBaseURL).toString();
  }

  const redirectURL = new URL(extension, appBaseURL);

  if (redirectURL.origin !== appBaseURL.origin) {
    return new URL('/', appBaseURL).toString();
  }

  return redirectURL.toString();
}

function LoginPage() {
  const search = useSearch({ from: '/_auth/login' });
  const [viewState, setViewState] = useState<
    'magic-link-form' | 'check-email' | 'error'
  >('magic-link-form');

  const [email, setEmail] = useState('');

  const handleLogin = async (values: MagicLinkFormValues) => {
    const callbackURL = buildCallbackURL(search.redirect);

    const response = await authClient.signIn.magicLink({
      email: values.email,
      callbackURL,
    });

    if (response.error) {
      setViewState('error');
    } else {
      setEmail(values.email);
      setViewState('check-email');
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        {viewState === 'magic-link-form' && (
          <MagicLinkForm onSubmit={handleLogin} />
        )}
        {viewState === 'check-email' && (
          <CheckEmail
            email={email}
            onBackClick={() => setViewState('magic-link-form')}
          />
        )}
        {viewState === 'error' && (
          <ErrorView onBackClick={() => setViewState('magic-link-form')} />
        )}
      </div>
    </div>
  );
}

const magicLinkSchema = z.object({
  email: z.email('Please enter a valid email for login'),
});

type MagicLinkFormValues = z.infer<typeof magicLinkSchema>;

interface MagicLinkFormProps {
  onSubmit: (values: MagicLinkFormValues) => void;
  defaultValues?: Partial<MagicLinkFormValues>;
}

function MagicLinkForm(props: MagicLinkFormProps) {
  const { defaultValues, onSubmit } = props;
  const form = useForm({
    resolver: zodResolver(magicLinkSchema),
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

const manualCodeSchema = z.object({
  token: z.string().min(32, 'Please enter a valid verification code'),
});

type ManualCodeFormValues = z.infer<typeof manualCodeSchema>;
interface CheckEmailProps {
  email: string;
  onBackClick: () => void;
}

function CheckEmail(props: CheckEmailProps) {
  const { email, onBackClick } = props;
  const navigate = useNavigate();
  const search = useSearch({ from: '/_auth/login' });

  const [manual, setManual] = useState(false);

  const form = useForm({
    resolver: zodResolver(manualCodeSchema),
    defaultValues: {
      token: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const onSubmit = async (values: ManualCodeFormValues) => {
    form.clearErrors();
    setLoading(true);
    const response = await authClient.magicLink.verify({
      query: {
        token: values.token,
      },
    });

    if (response.error) {
      form.setError('token', {
        message: 'Invalid verification code. Please try again.',
      });
    } else {
      navigate({ to: search.redirect || '/' });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-8 items-center justify-center rounded-md">
          <MailCheck className="size-6" />
        </div>
        <span className="sr-only">phanty</span>
        <h1 className="text-xl font-bold">Check your email</h1>
        <FieldDescription className="px-6 text-center">
          We've sent you a temporary login link.
          <br />
          Please check your inbox at
          <br />
          <span className="font-semibold">{email}</span>
        </FieldDescription>
      </div>
      {manual ? (
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="token"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Code</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Enter your verification code"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Field>
              <LoadingButton loading={loading} type="submit">
                Continue with code
              </LoadingButton>
            </Field>
          </FieldGroup>
        </form>
      ) : (
        <Button onClick={() => setManual(true)}>Enter code manually</Button>
      )}
      <Button variant="link" onClick={onBackClick}>
        Back to login
      </Button>
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
          We are experiencing some issues with the login at the moment.
          <br />
          <br />
          Please try again later. If the problem persists, contact our support
          team.
        </FieldDescription>
      </div>
      <Button variant="link" onClick={onBackClick}>
        Back to login
      </Button>
    </div>
  );
}
