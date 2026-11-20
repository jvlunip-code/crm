import { Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';

import { TableCard } from '@/components/shared/TableCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CardError } from '@/components/dashboard/CardError';
import { useServicesPage } from '@/hooks/use-services-list';
import { serviceEndUrgency, todayInLisbon } from '@/lib/status';
import { formatCurrency, formatDayMonthYear } from '@/lib/utils';
import type { ServicesPageParams } from '@/lib/api-client';

const ROWS = 6;
const PARAMS: ServicesPageParams = { ending: '90', ordering: 'data_fim', page: 1, pageSize: ROWS };

/**
 * "Próximos a terminar": the next services to end within 90 days (the same
 * `?ending=90` window as the Serviços page, soonest first). Each row links to
 * its customer.
 */
export function EndingSoonTable() {
  const { data, isLoading, isError, refetch } = useServicesPage(PARAMS);
  const today = todayInLisbon();
  const items = data?.items ?? [];

  return (
    <TableCard
      className="min-w-0 shrink grow-2 basis-130"
      title="Próximos a terminar"
      action={
        <Button variant="link" asChild>
          <Link to="/services?ending=90">Ver todos</Link>
        </Button>
      }
    >
      {isError ? (
        <CardError onRetry={() => void refetch()} />
      ) : !isLoading && items.length === 0 ? (
        <EmptyState
          size="sm"
          icon={<CalendarCheck />}
          title="Nenhum serviço termina nos próximos 90 dias"
        />
      ) : (
        <Table inset className="min-w-160" aria-busy={isLoading || undefined}>
          <TableHeader>
            <TableRow>
              <TableHead>Serviço</TableHead>
              <TableHead>Operadora</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Data fim</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: ROWS }, (_, i) => (
                  <TableRow key={i} aria-hidden>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="mt-1.5 h-3.5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              : items.map((s) => {
                  const urgency = serviceEndUrgency(s.dataFim, today);
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <Link
                            to={`/customers/${s.customerId}`}
                            className="w-fit rounded-xs type-mono font-medium text-foreground hover:underline"
                          >
                            {s.acesso || 'Sem nº de acesso'}
                          </Link>
                          <span className="type-dense text-muted-foreground">
                            {s.customerName}
                            {s.parentId ? ' · sub-serviço' : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground-secondary">
                        {s.operadora || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {urgency ? (
                          <StatusBadge tone={urgency.tone}>{urgency.label}</StatusBadge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {formatCurrency(s.valor)}
                        <span className="text-muted-foreground">/mês</span>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap text-muted-foreground">
                        {s.dataFim ? formatDayMonthYear(s.dataFim) : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      )}
    </TableCard>
  );
}
