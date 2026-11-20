import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  useDismissNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useUnreadCount,
} from '@/hooks/use-notifications';
import { FLAG } from '@/lib/notifications/flag-style';
import { renderNotification } from '@/lib/notifications/renderers';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

type NotificationsBellProps = {
  /** Popover placement: `right` from the sidebar brand row, `bottom` from the mobile top bar. */
  side?: 'right' | 'bottom';
  align?: 'start' | 'end';
  /** 36px in the sidebar, 40px in the mobile top bar. */
  size?: 'icon-sm' | 'icon';
  className?: string;
};

/**
 * Unread notifications, triaged from any page: open the customer (marks the
 * row as read), mark as read, or dismiss. Rows follow the dashboard list
 * anatomy: title 500 + 13px meta with the urgency pill.
 */
export function NotificationsBell({
  side = 'right',
  align = 'start',
  size = 'icon-sm',
  className,
}: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();
  // Backend order is urgency: the services ending soonest come first.
  const { data: mostUrgent } = useNotifications({ isRead: false, pageSize: 8 });
  const markAsRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();
  const dismiss = useDismissNotification();

  const rows = mostUrgent?.results ?? [];

  const handleOpenRow = (n: Notification) => {
    if (!n.isRead) markAsRead.mutate(n.id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className={cn(
            'text-sidebar-foreground hover:bg-sidebar-hover aria-expanded:bg-sidebar-accent',
            className,
          )}
          aria-label={
            unreadCount > 0 ? `Notificações, ${unreadCount} por ler` : 'Notificações, tudo lido'
          }
        >
          <Bell aria-hidden className="size-4.5 stroke-[1.75]" />
          {unreadCount > 0 && (
            <span
              aria-hidden
              className="absolute top-2 right-2 size-2 rounded-full bg-status-info ring-2 ring-sidebar"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={8}
        collisionPadding={12}
        aria-label="Notificações por ler"
        className="flex max-h-(--radix-popover-content-available-height) w-[calc(100vw-1.5rem)] flex-col p-0 sm:w-96"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="type-section text-foreground">
            Notificações
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 type-caption font-normal text-muted-foreground tabular-nums">
                {unreadCount} por ler
              </span>
            )}
          </h2>
          {unreadCount > 0 && (
            <Button
              variant="link"
              size="xs"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center type-body text-muted-foreground">
            Sem notificações por ler.
          </p>
        ) : (
          <ul className="min-h-0 flex-1 overflow-y-auto" aria-label="Lista de notificações">
            {rows.map((n) => {
              const r = renderNotification(n);
              const flag = FLAG[r.flag];
              return (
                <li
                  key={n.id}
                  className="flex items-start gap-2 border-b border-border-subtle py-3 pr-2 pl-4 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      to={r.href}
                      onClick={() => handleOpenRow(n)}
                      className="block truncate rounded-xs type-body font-medium text-foreground hover:underline"
                    >
                      {r.title}
                    </Link>
                    <p className="mt-1 type-dense text-muted-foreground">{r.message}</p>
                    <Badge tone={flag.tone} dot className="mt-1.5">
                      {flag.label}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 items-center">
                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => markAsRead.mutate(n.id)}
                        aria-label={`Marcar como lida: ${n.metadata.serviceAcesso} — ${n.metadata.customerName}`}
                        title="Marcar como lida"
                      >
                        <Check aria-hidden />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => dismiss.mutate(n.id)}
                      aria-label={`Ignorar: ${n.metadata.serviceAcesso} — ${n.metadata.customerName}`}
                      title="Ignorar"
                    >
                      <X aria-hidden />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-border px-4 py-3">
          <Button variant="link" size="xs" asChild>
            <Link to="/notifications" onClick={() => setOpen(false)}>
              Ver todas
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
