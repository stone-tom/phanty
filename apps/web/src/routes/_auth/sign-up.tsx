import { createFileRoute } from '@tanstack/react-router';
import { SignupForm } from '@/components/signup-form';

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUp,
  staticData: {
    title: 'Create your account',
    description: 'Enter your email below to create your account',
  },
});

function SignUp() {
  return <SignupForm />;
}
