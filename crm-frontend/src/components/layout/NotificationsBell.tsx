import { Link, useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';

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
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Notification } from '@/types';

export function NotificationsBell() {
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: recent } = useNotifications({ isRead: false, pageSize: 8 });
  const markAsRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();
  const dismiss = useDismissNotification();

  const rows = recent?.results ?? [];

  const handleRowClick = (n: Notification) => {
    if (!n.isRead) markAsRead.mutate(n.id);
    navigate(renderNotification(n).href);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unreadCount > 0 ? `Notificações — ${unreadCount} por ler` : 'Notificações — tudo lido'
          }
        >
          <Bell aria-hidden />
          {unreadCount > 0 && (
            <span
              aria-hidden
              className="absolute top-1.5 right-1.5 size-2 rounded-full bg-status-info ring-2 ring-background"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label="Notificações"
        className="w-[calc(100vw-1.5rem)] p-0 sm:w-96"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h2 className="type-section">Notificações</h2>
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
          <ul className="max-h-96 overflow-y-auto" aria-label="Lista de notificações">
            {rows.map((n) => {
              const r = renderNotification(n);
              const flag = FLAG[r.flag];
              return (
                <li
                  key={n.id}
                  className="group relative border-b border-border-subtle last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => handleRowClick(n)}
                    className={cn(
                      'flex w-full cursor-pointer items-stretch gap-3 px-4 py-3 pr-10 text-left transition-colors outline-none hover:bg-accent/60 focus-visible:bg-accent/60',
                      !n.isRead && 'bg-selection/60',
                    )}
                  >
                    <span aria-hidden className={cn('w-0.5 shrink-0 rounded-full', flag.rule)} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'block truncate type-dense text-foreground',
                            !n.isRead && 'font-medium',
                          )}
                        >
                          {r.title}
                        </span>
                        <Badge tone={flag.tone}>{flag.label}</Badge>
                      </span>
                      <span className="mt-0.5 block type-caption text-foreground-secondary">
                        {r.message}
                      </span>
                      <span className="mt-1 block type-caption text-muted-foreground">
                        {formatRelativeTime(n.createdAt)}
                        {!n.isRead && ' · por ler'}
                      </span>
                    </span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="absolute top-2.5 right-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => dismiss.mutate(n.id)}
                    aria-label="Ignorar"
                  >
                    <X />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-border px-4 py-2.5">
          <Button variant="link" size="xs" asChild>
            <Link to="/notifications">Ver todas</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
