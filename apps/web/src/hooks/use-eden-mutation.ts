import type { Treaty } from '@elysiajs/eden';
import {
  type MutationFunction,
  type UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';

export function useEdenMutation<
  T extends Record<number, unknown>,
  TVariables = void,
  TContext = unknown,
>(
  mutationFn: MutationFunction<Treaty.TreatyResponse<T>, TVariables>,
  options?: Omit<
    UseMutationOptions<
      Treaty.Data<Treaty.TreatyResponse<T>>,
      Treaty.Error<Treaty.TreatyResponse<T>>,
      TVariables,
      TContext
    >,
    'mutationFn'
  >,
) {
  return useMutation<
    Treaty.Data<Treaty.TreatyResponse<T>>,
    Treaty.Error<Treaty.TreatyResponse<T>>,
    TVariables,
    TContext
  >({
    mutationFn: async (variables, context) => {
      const response = await mutationFn(variables, context);

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
