import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

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
  },
});

function PrivateRoute() {
  return (
    <div>
      PRIVATE ROUTE
      <Outlet />
    </div>
  );
}
