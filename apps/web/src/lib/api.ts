import { env } from '@/env';
import { treaty } from '@elysiajs/eden'
import type { App } from '@repo/api';

export const api = treaty<App>(env.VITE_API_URL, {
  fetch: {
    credentials: 'include',
  },
});


