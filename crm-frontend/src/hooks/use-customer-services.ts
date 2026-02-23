import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerServicesApi } from '@/lib/api-client'
import type { CustomerService } from '@/types'

export function useCustomerServices(customerId: number) {
  return useQuery({
    queryKey: ['customer-services', customerId],
    queryFn: () => customerServicesApi.getByCustomerId(customerId),
    enabled: !!customerId,
  })
}

export function useCreateCustomerService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: customerServicesApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-services', variables.customerId] })
    },
  })
}

export function useUpdateCustomerService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates, customerId }: { id: number; updates: Partial<CustomerService>; customerId: number }) =>
      customerServicesApi.update(id, updates, customerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-services', variables.customerId] })
    },
  })
}

export function useDeleteCustomerService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, customerId }: { id: number; customerId: number }) =>
      customerServicesApi.delete(id, customerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-services', variables.customerId] })
    },
  })
}
