import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { servicesApi } from '@/lib/mock-data'
import type { Service } from '@/types'

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: servicesApi.getAll,
  })
}

export function useService(id: number) {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => servicesApi.getById(id),
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Service> }) =>
      servicesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: servicesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}
