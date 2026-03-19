import { createFileRoute, Outlet, useMatches } from '@tanstack/react-router';
import { CakeSlice } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FieldDescription } from '@/components/ui/field';

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});

function AuthLayout() {
  const matches = useMatches();
  const activeMatch = matches[matches.length - 1];
  const title = activeMatch.staticData.title ?? 'Authentication';
  const description =
    activeMatch.staticData.description ?? 'Account management';

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
          EVAL LAB
        </a>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Outlet />
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center">
            By clicking continue, you agree to our{' '}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </FieldDescription>
        </div>
      </div>
    </div>
  );
}
