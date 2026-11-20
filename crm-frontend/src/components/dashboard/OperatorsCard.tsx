import { SectionCard } from '@/components/shared/SectionCard';
import { RankedBars } from '@/components/shared/RankedBars';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { CardError } from '@/components/dashboard/CardError';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { formatShare } from '@/components/dashboard/format';
import { formatCount } from '@/lib/utils';

function servicesLabel(n: number): string {
  return `${formatCount(n)} ${n === 1 ? 'serviço' : 'serviços'}`;
}

/**
 * "Operadoras": the top operators by active services (`topOperators`, at
 * most 5, empty operadora excluded by the backend) with their share of all
 * active services. The footer is the remainder — other operators *and*
 * services with no operator — hence "Outras / sem operadora".
 */
export function OperatorsCard() {
  const { data: summary, isLoading, isError, refetch } = useDashboardSummary();

  const active = summary?.services.active ?? 0;
  const top = summary?.topOperators ?? [];
  const rest = Math.max(0, active - top.reduce((sum, o) => sum + o.count, 0));

  return (
    <SectionCard
      className="min-w-0 shrink grow basis-75"
      title="Operadoras"
      description={
        summary ? `${servicesLabel(active)} ${active === 1 ? 'ativo' : 'ativos'}` : undefined
      }
      footer={
        summary && active > 0 ? (
          <>
            <span className="type-body text-muted-foreground">Outras / sem operadora</span>
            <span className="type-body font-medium text-foreground tabular-nums">
              {servicesLabel(rest)}
            </span>
          </>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-4.5" aria-hidden>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-2.5 w-full rounded-xs" />
            </div>
          ))}
        </div>
      ) : isError || !summary ? (
        <CardError onRetry={() => void refetch()} />
      ) : (
        <RankedBars
          max={top[0]?.count}
          rows={top.map((o) => ({
            key: o.operadora,
            label: o.operadora,
            count: o.count,
            extra: formatShare(o.count, active),
          }))}
          empty={
            <EmptyState
              size="sm"
              title={active === 0 ? 'Sem serviços ativos' : 'Nenhum serviço ativo tem operadora'}
              description="As operadoras aparecem aqui quando houver serviços ativos com operadora."
            />
          }
        />
      )}
    </SectionCard>
  );
}
