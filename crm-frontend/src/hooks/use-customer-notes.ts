import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerNotesApi } from '@/lib/mock-data'
import type { CustomerNote } from '@/types'

export function useCustomerNotes(customerId: number) {
  return useQuery({
    queryKey: ['customer-notes', customerId],
    queryFn: () => customerNotesApi.getByCustomerId(customerId),
    enabled: !!customerId,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: customerNotesApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-notes', variables.customerId] })
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<CustomerNote> }) =>
      customerNotesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-notes'] })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: customerNotesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-notes'] })
    },
  })
}
