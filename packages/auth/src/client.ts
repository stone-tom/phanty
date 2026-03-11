import { createAuthClient } from 'better-auth/client';

interface InitAuthClientParams {
  baseURL: string;
}

export const initAuthClient = ({ baseURL }: InitAuthClientParams) => {
  return createAuthClient({
    baseURL: baseURL,
    plugins: [],
  });
};
