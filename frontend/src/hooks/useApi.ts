import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { api } from '../services/api'

export function useApiQuery<T>(
  key: string[],
  url: string,
  options?: Omit<UseQueryOptions<T, AxiosError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, AxiosError>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get<T>(url)
      return data
    },
    ...options,
  })
}

export function useApiMutation<T, V>(
  url: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post',
  options?: UseMutationOptions<T, AxiosError, V>
) {
  return useMutation<T, AxiosError, V>({
    mutationFn: async (variables) => {
      const { data } = await api[method]<T>(url, variables)
      return data
    },
    ...options,
  })
}
