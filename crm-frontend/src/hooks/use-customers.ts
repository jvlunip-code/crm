import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { customersApi } from '@/lib/api-client'
import type { Customer } from '@/types'

export function useCustomers(search?: string) {
  return useQuery({
    queryKey: ['customers', { search: search ?? '' }],
    queryFn: () => customersApi.getAll(search),
    placeholderData: keepPreviousData,
  })
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customersApi.getById(id),
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Customer> }) =>
      customersApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
