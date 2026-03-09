import { createFileRoute } from '@tanstack/react-router';
import { CakeSlice } from 'lucide-react';
import { LoginForm } from '@/components/login-form';

export const Route = createFileRoute('/login')({
  component: Login,
});

function Login() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a
          href="/"
          className="flex flex-col items-center gap-2 self-center font-medium"
        >
          <div className="flex size-16 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CakeSlice className="size-12" />
          </div>
          CONVERT EVERYTHING
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
