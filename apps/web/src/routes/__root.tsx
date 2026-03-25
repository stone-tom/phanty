import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { authClient } from '@/lib/auth';

const queryClient = new QueryClient();

const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Outlet />
    </TooltipProvider>
    <Toaster />
  </QueryClientProvider>
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
