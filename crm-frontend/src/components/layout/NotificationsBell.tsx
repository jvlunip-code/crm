import { Link, useNavigate } from 'react-router-dom'
import { Bell, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  useDismissNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useUnreadCount,
} from '@/hooks/use-notifications'
import { flagDotClass } from '@/lib/notifications/flag-style'
import { renderNotification } from '@/lib/notifications/renderers'
import { formatRelativeTime } from '@/lib/utils'
import type { Notification } from '@/types'

export function NotificationsBell() {
  const navigate = useNavigate()
  const { data: unreadCount = 0 } = useUnreadCount()
  const { data: recent } = useNotifications({ pageSize: 8 })
  const markAsRead = useMarkAsRead()
  const markAllRead = useMarkAllAsRead()
  const dismiss = useDismissNotification()

  const rows = recent?.results ?? []

  const handleRowClick = (n: Notification) => {
    if (!n.isRead) markAsRead.mutate(n.id)
    navigate(renderNotification(n).href)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px] leading-none"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="text-sm font-medium">Notificações</div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => markAllRead.mutate()}
            disabled={unreadCount === 0 || markAllRead.isPending}
          >
            Marcar todas como lidas
          </Button>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {rows.length === 0 ? (
            <div className="text-muted-foreground px-3 py-6 text-center text-sm">
              Sem notificações.
            </div>
          ) : (
            rows.map(n => {
              const r = renderNotification(n)
              return (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleRowClick(n)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleRowClick(n)
                    }
                  }}
                  className={`group flex cursor-pointer items-start gap-2 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-muted/50 ${
                    n.isRead ? '' : 'bg-muted/20'
                  }`}
                >
                  <span className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${flagDotClass[r.flag]}`} />
                  <div className="min-w-0 flex-1">
                    <div className={`truncate ${n.isRead ? 'font-normal' : 'font-medium'}`}>
                      {r.title}
                    </div>
                    <div className="text-muted-foreground truncate text-xs">{r.message}</div>
                    <div className="text-muted-foreground mt-0.5 text-[11px]">
                      {formatRelativeTime(n.createdAt)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={e => {
                      e.stopPropagation()
                      dismiss.mutate(n.id)
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="sr-only">Ignorar</span>
                  </Button>
                </div>
              )
            })
          )}
        </div>

        <div className="border-t px-3 py-2">
          <Link
            to="/notifications"
            className="text-sm text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
