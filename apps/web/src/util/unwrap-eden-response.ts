import type { projects } from '@/queries/projects'
import type { App } from '@api/index'
import { type Treaty, treaty } from '@elysiajs/eden'
import type { inferQueryKeys } from '@lukemorales/query-key-factory'
import {
  type QueryFunction,
  type QueryKey,
  type UseQueryOptions,
  useQuery
} from '@tanstack/react-query'

// export class EdenApiError<E> extends Error {
//   public readonly apiError: E;

//   constructor(apiError: E) {
//     super(typeof apiError === 'string' ? apiError : 'API Error');
//     this.name = 'EdenApiError';
//     this.apiError = apiError;
//   }
// }

// type InferData<T> = T extends { data: infer D; error: null } ? D : never;
// type InferError<T> = T extends { data: null; error: infer E } ? E : never;

// type EdenPromise = Promise<{ data: unknown; error: null } | { data: null; error: unknown }>;

// export async function unwrapEdenResponse<T extends EdenPromise>(
//   promise: T
// ): Promise<InferData<Awaited<T>>> {
//   const response = await promise;

//   if (response.error) {
//     throw new EdenApiError<InferError<Awaited<T>>>(
//       response.error as InferError<Awaited<T>>
//     )
//   }

//   return response.data;
// }

export function useEdenQuery<
  T extends Record<number, unknown>,
  K extends QueryKey
>(
  queryDef: {
    queryKey: K,
    queryFn: QueryFunction<Treaty.TreatyResponse<T>>
  },
  options?: Omit<
    UseQueryOptions<
      Treaty.Data<Treaty.TreatyResponse<T>>,
      Treaty.Error<Treaty.TreatyResponse<T>>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<
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