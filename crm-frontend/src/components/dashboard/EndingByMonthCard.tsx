import { SectionCard } from '@/components/shared/SectionCard';
import { ColumnChart } from '@/components/shared/ColumnChart';
import { Skeleton } from '@/components/ui/skeleton';
import { CardError } from '@/components/dashboard/CardError';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { formatMonthLong, formatMonthShort, formatMonthYear } from '@/components/dashboard/format';
import { formatCount } from '@/lib/utils';

/** Plot height in px (value labels included); the month labels add ~24px. */
const CHART_HEIGHT = 168;

/**
 * "Serviços a terminar": services by end month over the next 12 months
 * (`endingByMonth`, starting on the 1st of the current month — so the first
 * column also counts services that already ended this month, which the
 * subtitle says).
 */
export function EndingByMonthCard() {
  const { data: summary, isLoading, isError, refetch } = useDashboardSummary();

  const months = summary?.endingByMonth ?? [];
  const total = months.reduce((sum, m) => sum + m.count, 0);
  const firstMonth = months[0]?.month;

  return (
    <SectionCard
      className="min-w-0 shrink grow-2 basis-130"
      title="Serviços a terminar"
      description={
        firstMonth
          ? `Por mês, nos próximos 12 meses (${formatMonthLong(firstMonth)} inclui os que já terminaram este mês)`
          : 'Por mês, nos próximos 12 meses'
      }
      action={
        summary && (
          <div className="flex flex-col items-end gap-0.5 text-right">
            <span className="type-figure text-foreground tabular-nums">
              {formatCount(total)}
              <span className="sr-only"> serviços nos 12 meses</span>
            </span>
            <span className="type-dense text-muted-foreground tabular-nums">
              <strong className="font-medium text-foreground">
                {formatCount(summary.ending.within90)}
              </strong>{' '}
              nos próximos 90 dias
            </span>
          </div>
        )
      }
    >
      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-md" />
      ) : isError || !summary ? (
        <CardError onRetry={() => void refetch()} />
      ) : (
        <ColumnChart
          title="Serviços a terminar por mês"
          categoryLabel="Mês"
          valueLabel="Serviços"
          height={CHART_HEIGHT}
          highlightIndex={0}
          data={months.map((m) => ({
            key: m.month,
            label: formatMonthShort(m.month),
            fullLabel: formatMonthYear(m.month),
            value: m.count,
          }))}
        />
      )}
    </SectionCard>
  );
}
