import { KpiCard, KpiGrid } from '@/components/shared/KpiCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { daysUntil, serviceEndUrgency, todayInLisbon } from '@/lib/status';
import { formatCount, formatCurrency, formatDayMonthYear } from '@/lib/utils';
import type { CustomerService } from '@/types';

interface CustomerSummaryCardsProps {
  /** All service rows of the customer, sub-services included (flattened). */
  services: CustomerService[];
  documentsCount: number;
  servicesLoading?: boolean;
  documentsLoading?: boolean;
}

/**
 * KPI row of the customer page. Everything is computed from the **active**
 * services only, with the backend's definition: no `data_fim`, or `data_fim`
 * on or after today (Lisbon). Sub-services count, as on the dashboard.
 * `valor` is treated as monthly (PLAN decision 13). "Cliente desde" is not
 * shown: imported customers carry the import date (decision 17).
 */
export function CustomerSummaryCards({
  services,
  documentsCount,
  servicesLoading = false,
  documentsLoading = false,
}: CustomerSummaryCardsProps) {
  const today = todayInLisbon();
  const isActive = (s: CustomerService) => (daysUntil(s.dataFim, today) ?? 0) >= 0;
  const active = services.filter(isActive);
  const expiredCount = services.length - active.length;
  const monthly = active.reduce((total, s) => total + s.valor, 0);

  const nextEnd = active
    .map((s) => s.dataFim)
    .filter((d): d is string => !!d)
    .sort()[0];
  const nextUrgency = nextEnd ? serviceEndUrgency(nextEnd, today) : null;

  const unit = (text: string) => (
    <span className="font-sans type-body text-muted-foreground">{text}</span>
  );

  return (
    <KpiGrid size="md" role="group" aria-label="Resumo do cliente">
      <KpiCard
        size="md"
        label="Valor mensal"
        loading={servicesLoading}
        value={
          <>
            {formatCurrency(monthly)}
            {unit('/mês')}
          </>
        }
        detail={active.length > 0 ? 'Soma dos serviços ativos' : 'Sem serviços ativos'}
      />
      <KpiCard
        size="md"
        label="Serviços ativos"
        loading={servicesLoading}
        value={
          <>
            {formatCount(active.length)}
            {services.length > 0 && unit(` · de ${formatCount(services.length)}`)}
          </>
        }
      />
      <KpiCard
        size="md"
        label="Próximo fim"
        loading={servicesLoading}
        value={nextEnd ? formatDayMonthYear(nextEnd) : '—'}
        detail={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {nextUrgency ? (
              <StatusBadge tone={nextUrgency.tone}>{nextUrgency.label}</StatusBadge>
            ) : (
              <span>{active.length > 0 ? 'Sem data de fim' : 'Sem serviços ativos'}</span>
            )}
            {expiredCount > 0 && (
              <span className="font-medium text-status-error-fg">
                {formatCount(expiredCount)} terminado{expiredCount === 1 ? '' : 's'}
              </span>
            )}
          </span>
        }
      />
      <KpiCard
        size="md"
        label="Documentos"
        loading={documentsLoading}
        value={formatCount(documentsCount)}
      />
    </KpiGrid>
  );
}
