import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { env } from '@/env';
import { authClient } from '@/lib/auth';

const forgotPasswordSchema = z.object({
  email: z.email('Invalid email address').toLowerCase().trim(),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onClose: () => void;
}

export function ForgotPasswordForm({ onClose }: ForgotPasswordFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (input: ForgotPasswordSchema) => {
    setLoading(true);

    const { error } = await authClient.requestPasswordReset({
      email: input.email,
      redirectTo: `${env.VITE_BASE_URL}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('You will receive a mail with the reset link!');
      form.reset();
      onClose();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.stopPropagation();
        form.handleSubmit(onSubmit)(e);
      }}
    >
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
        <Field>
          <Button type="submit" disabled={loading}>
            Reset password
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
