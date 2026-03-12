import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Toaster } from '@/components/ui/sonner';
import { authClient } from '@/lib/auth';

const RootLayout = () => (
  <>
    <Outlet />
    <Toaster />
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({
  component: RootLayout,
  beforeLoad: async () => {
    const { data } = await authClient.getSession();

    return {
      authData: data,
    };
  },
});
