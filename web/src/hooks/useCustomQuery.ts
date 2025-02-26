/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MutationCache,
  QueryCache,
  QueryClient,
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { setPopupError } from '@/utils/error';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err) => setPopupError(err.toString()),
  }),
  mutationCache: new MutationCache({
    onError: (err) => setPopupError(err.toString()),
  }),
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
});

export function useCustomMutation<TParams = void, TReturn = void>(
  fn: (data: TParams) => Promise<TReturn>
) {
  return useMutation<TReturn, string, TParams>({ mutationFn: fn }, queryClient);
}
export type CustomMutation<TParams = void, TReturn = void> = UseMutationResult<
  TReturn,
  string,
  TParams
>;
export type CustomMutateFn<TParams = void, TReturn = void> = CustomMutation<
  TParams,
  TReturn
>['mutate'];

export function useCustomQuery<TReturn = unknown>(
  key: any[],
  fn: () => Promise<TReturn>,
  deps?: any[]
) {
  return useQuery<TReturn, string>(
    {
      queryKey: key,
      queryFn: fn,
      enabled: deps ? deps.every((x) => x) : true,
    },
    queryClient
  );
}
export type CustomQuery<TReturn = unknown> = UseQueryResult<TReturn, string>;
