import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerDocumentsApi } from '@/lib/api-client'

export function useCustomerDocuments(customerId: number) {
  return useQuery({
    queryKey: ['customer-documents', customerId],
    queryFn: () => customerDocumentsApi.getByCustomerId(customerId),
    enabled: !!customerId,
  })
}

export function useDeleteDocument(customerId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: number) => customerDocumentsApi.delete(documentId, customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-documents', customerId] })
    },
  })
}
