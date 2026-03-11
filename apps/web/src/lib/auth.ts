import { initAuthClient } from '@repo/auth/client';
import { env } from '@/env';

export const authClient = initAuthClient({
  baseURL: env.VITE_API_URL,
});
