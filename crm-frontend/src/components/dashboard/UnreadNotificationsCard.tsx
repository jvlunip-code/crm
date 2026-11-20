import { Link } from 'react-router-dom';
import { BellOff, Check } from 'lucide-react';

import { SectionCard } from '@/components/shared/SectionCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CardError } from '@/components/dashboard/CardError';
import { formatCount, formatServiceDate } from '@/lib/utils';
import { useMarkAsRead, useNotifications } from '@/hooks/use-notifications';
import { renderNotification } from '@/lib/notifications/renderers';
import { serviceEndUrgency, todayInLisbon } from '@/lib/status';
import { cn } from '@/lib/utils';

const ROWS = 5;

const URGENCY_TEXT = {
  error: 'font-medium text-status-error-fg',
  warning: 'font-medium text-status-warning-fg',
  neutral: '',
} as const;

/**
 * "Notificações por ler": the 5 most urgent unread notifications (the API
 * orders them by end date). The title is the only link — it marks the
 * notification read and opens the customer; the check button only marks it
 * read. Urgency is spelled out ("Faltam 12 dias", "Terminado"); colour only
 * reinforces it.
 */
export function UnreadNotificationsCard() {
  const { data, isLoading, isError, refetch } = useNotifications({ isRead: false, pageSize: ROWS });
  const markAsRead = useMarkAsRead();
  const today = todayInLisbon();

  const rows = data?.results ?? [];
  const count = data?.count ?? 0;

  return (
    <SectionCard
      className="min-w-0 shrink grow basis-75"
      title="Notificações por ler"
      action={
        data && (
          <span className="rounded-full bg-muted px-2 py-0.5 type-caption text-muted-foreground tabular-nums">
            {formatCount(count)} por ler
          </span>
        )
      }
      footer={
        <Button variant="link" asChild>
          <Link to="/notifications?estado=por-ler">Ver todas</Link>
        </Button>
      }
    >
      {isLoading ? (
        <ul aria-hidden className="flex flex-col">
          {Array.from({ length: 3 }, (_, i) => (
            <li
              key={i}
              className="flex items-center gap-3 border-b border-border-subtle py-3 last:border-b-0"
            >
              <Skeleton className="size-8 shrink-0 rounded-sm" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3.5 w-1/2" />
              </div>
            </li>
          ))}
        </ul>
      ) : isError ? (
        <CardError onRetry={() => void refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState size="sm" icon={<BellOff />} title="Sem notificações por ler" />
      ) : (
        <ul className="flex flex-col" aria-label="Notificações por ler">
          {rows.map((n) => {
            const { href } = renderNotification(n);
            const m = n.metadata;
            const urgency = serviceEndUrgency(m.serviceDataFim, today);
            const pending = markAsRead.isPending && markAsRead.variables === n.id;
            return (
              <li
                key={n.id}
                className="flex items-center gap-3 border-b border-border-subtle py-3 last:border-b-0"
              >
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => markAsRead.mutate(n.id)}
                  disabled={pending}
                  aria-label={`Marcar como lida: ${m.serviceAcesso} — ${m.customerName}`}
                  title="Marcar como lida"
                >
                  <Check aria-hidden />
                </Button>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Link
                    to={href}
                    onClick={() => markAsRead.mutate(n.id)}
                    className="w-fit max-w-full truncate rounded-xs type-body font-medium text-foreground hover:underline"
                  >
                    {m.serviceAcesso} — {m.customerName}
                  </Link>
                  <p className="type-dense text-muted-foreground tabular-nums">
                    Termina a {formatServiceDate(m.serviceDataFim)}
                    {urgency && (
                      <>
                        {' · '}
                        <span className={cn(URGENCY_TEXT[urgency.tone])}>{urgency.label}</span>
                      </>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
