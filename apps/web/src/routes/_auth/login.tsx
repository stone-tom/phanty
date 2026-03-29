import { createFileRoute, redirect } from '@tanstack/react-router';
import z from 'zod';

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

function LoginPage() {
  return <div>Login</div>;
}
