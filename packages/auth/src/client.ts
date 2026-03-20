import { organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

interface InitAuthClientParams {
  baseURL: string;
}

export const initAuthClient = ({ baseURL }: InitAuthClientParams) => {
  return createAuthClient({
    baseURL: baseURL,
    plugins: [organizationClient()],
  });
};
