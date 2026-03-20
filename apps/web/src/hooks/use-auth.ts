import { useRouteContext } from '@tanstack/react-router';
export function useAuth() {
  const context = useRouteContext({ strict: false });

  if (!context.authData) {
    throw new Error('useAuth must be used within an authenticated route');
  }

  return context.authData;
}
