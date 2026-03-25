import type { Treaty } from '@elysiajs/eden';
import {
  type QueryFunction,
  type UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';

export function useEdenQuery<
  T extends Record<number, unknown>,
  K extends readonly unknown[],
>(
  queryDef: {
    queryKey: K;
    queryFn: QueryFunction<Treaty.TreatyResponse<T>, K>;
  },
  options?: Omit<
    UseQueryOptions<
      Treaty.Data<Treaty.TreatyResponse<T>>,
      Treaty.Error<Treaty.TreatyResponse<T>>,
      Treaty.Data<Treaty.TreatyResponse<T>>,
      K
    >,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<
    Treaty.Data<Treaty.TreatyResponse<T>>,
    Treaty.Error<Treaty.TreatyResponse<T>>,
    Treaty.Data<Treaty.TreatyResponse<T>>,
    K
  >({
    queryKey: queryDef.queryKey,
    queryFn: async (context) => {
      const response = await queryDef.queryFn(context);

      if (response.error) {
        throw response.error;
      }

      if (response.data !== undefined) {
        return response.data as Treaty.Data<Treaty.TreatyResponse<T>>;
      }

      throw new Error('No data returned from API');
    },
    ...options,
  });
}
