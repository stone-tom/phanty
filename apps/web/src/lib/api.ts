import { env } from '@/env';
import { treaty, type Treaty } from '@elysiajs/eden'
import type { App } from '@repo/api';
import {
  useQuery as useTanstackQuery,
  useMutation as useTanstackMutation,
  type UseQueryOptions,
  type QueryKey,
} from '@tanstack/react-query'
import { isObject } from 'lodash';

const client = treaty<App>(env.VITE_API_URL);

export const api = client;

// Recursively transform: keep nested objects, but turn functions into
// key-returning functions that accept the same params
type KeyProxy<T> = {
  [K in keyof T]: T[K] extends (
    params: infer P,
  ) => infer R
    ? ((params: P) => KeyProxy<R>) &
        KeyProxy<Omit<T[K], keyof Function>>
    : T[K] extends (
          ...args: any[]
        ) => Promise<any>
      ? // Terminal method — no args required, returns string[]
        () => string[]
      : T[K] extends Record<string, any>
        ? KeyProxy<T[K]>
        : () => string[];
};
function createKeyProxy<T>(path: (string | object)[] = []): KeyProxy<T> {
  return new Proxy((() => path) as any, {
    get(_, prop: string) {
      // Allow array inspection by React Query
      if (prop === Symbol.iterator as any) return path[Symbol.iterator].bind(path);
      if (prop === 'length') return path.length;
      if (typeof prop === 'symbol') return (path as any)[prop];

      return createKeyProxy([...path, prop]);
    },
    apply(_, __, args: any[]) {
      const params = args[0];
      if (params && typeof params === 'object' && Object.keys(params).length > 0) {
        return [...path, params];
      }
      return [...path];
    },
  });
}

export const apiKeys = createKeyProxy<typeof client>();

console.log('test', apiKeys.v1.projects({ id: 'test' }).get({}));
/**
 * Typed useQuery hook for Eden Treaty endpoints
 * Automatically infers data and error types from the Treaty response
 * Usage: const { data, error } = useQuery(['user', 'profile'], () => api.user.profile.get())
 */
export function useQuery<
  T extends Record<number, unknown> = Record<number, unknown>
>(
  queryKey: QueryKey,
  treatyFn: () => Promise<Treaty.TreatyResponse<T>>,
  options?: Omit<
    UseQueryOptions<
      Treaty.Data<Treaty.TreatyResponse<T>>,
      Treaty.Error<Treaty.TreatyResponse<T>>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useTanstackQuery<
    Treaty.Data<Treaty.TreatyResponse<T>>,
    Treaty.Error<Treaty.TreatyResponse<T>>
  >({
    queryKey,
    queryFn: async () => {
      const response = await treatyFn()

      if (response.error) {
        throw response.error
      }

      if (response.data !== undefined) {
        return response.data as Treaty.Data<Treaty.TreatyResponse<T>>
      }

      throw new Error('No data returned from API')
    },
    ...options
  })
}