import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
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

const loginSchema = z.object({
  email: z.email('Invalid email address').toLowerCase().trim(),
  password: z.string(),
});

type LoginSchema = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const search = useSearch({ from: '/_auth/login' });
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (input: LoginSchema) => {
    setLoading(true);

    const { error } = await authClient.signIn.email({
      email: input.email,
      password: input.password,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Successfully signed in!');
      form.reset();
      router.navigate({ to: search.redirect || '/' });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                id="email"
                type="email"
                placeholder="m@example.com"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-2">
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  {...field}
                  id="password"
                  type="password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
          )}
        />
        <Field>
          <Button type="submit" disabled={loading}>
            Login
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account? <Link to="/sign-up">Sign up</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
