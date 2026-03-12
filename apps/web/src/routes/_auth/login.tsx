import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { LoginForm } from '@/components/login-form';

const searchParamSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/_auth/login')({
  component: Login,
  staticData: {
    title: 'Welcome back',
    description: 'Login with your account',
  },
  validateSearch: searchParamSchema,
});

function Login() {
  return <LoginForm />;
}
