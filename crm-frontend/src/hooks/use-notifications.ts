import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { notificationsApi, type NotificationsListParams } from '@/lib/api-client'

const LIST_KEY = 'notifications'
const COUNT_KEY = 'notifications-unread-count'

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: [LIST_KEY] })
  qc.invalidateQueries({ queryKey: [COUNT_KEY] })
}

export function useNotifications(params: NotificationsListParams = {}) {
  return useQuery({
    queryKey: [LIST_KEY, params],
    queryFn: () => notificationsApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useAllNotifications(params: Omit<NotificationsListParams, 'page' | 'pageSize'> = {}) {
  return useQuery({
    queryKey: [LIST_KEY, 'all', params],
    queryFn: () => notificationsApi.listAll(params),
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [COUNT_KEY],
    queryFn: notificationsApi.unreadCount,
    staleTime: 30_000,
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => invalidate(qc),
  })
}

export function useMarkAsUnread() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markUnread,
    onSuccess: () => invalidate(qc),
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => invalidate(qc),
  })
}

export function useDismissNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.dismiss,
    onSuccess: () => invalidate(qc),
  })
}

export function useTriggerServiceEnding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.triggerServiceEnding,
    onSuccess: () => invalidate(qc),
  })
}
