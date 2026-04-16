import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export const Route = createFileRoute('/_private')({
  component: PrivateRoute,
  beforeLoad: async ({ context, location }) => {
    if (!context.authData) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }

    if (!context.authData.user.name) {
      throw redirect({
        to: '/setup-account',
      });
    }

    if (!context.authData.session.activeOrganizationId) {
      throw redirect({
        to: '/setup-org',
      });
    }
  },
});

function PrivateRoute() {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="min-h-0 overflow-hidden">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
