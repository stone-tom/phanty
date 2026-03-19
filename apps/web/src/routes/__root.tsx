import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { authClient } from '@/lib/auth';

const RootLayout = () => (
  <>
    <TooltipProvider>
      <Outlet />
    </TooltipProvider>
    <Toaster />
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
