import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerAddressApi } from '@/lib/api-client'
import type { CustomerAddress } from '@/types'

export function useCustomerAddress(customerId: number) {
  return useQuery({
    queryKey: ['customer-address', customerId],
    queryFn: () => customerAddressApi.getByCustomerId(customerId),
    enabled: !!customerId,
  })
}

export function useUpsertCustomerAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (address: Omit<CustomerAddress, 'id'>) => customerAddressApi.upsert(address),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-address', variables.customerId] })
    },
  })
}
