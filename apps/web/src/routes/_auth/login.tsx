import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '@/components/login-form';

export const Route = createFileRoute('/_auth/login')({
  component: Login,
  staticData: {
    title: 'Welcome back',
    description: 'Login with your account',
  },
});

function Login() {
  return <LoginForm />;
}
