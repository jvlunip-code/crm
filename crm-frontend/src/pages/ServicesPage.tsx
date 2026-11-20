import * as React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CornerDownRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListTabs, type ListTab } from '@/components/shared/ListTabs';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { SearchField } from '@/components/shared/SearchField';
import { SortableHead, type SortHeadState } from '@/components/shared/SortableHead';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableCard } from '@/components/shared/TableCard';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useServicesPage } from '@/hooks/use-services-list';
import { serviceEndUrgency } from '@/lib/status';
import { cn, formatCount, formatCurrency, formatServiceDate } from '@/lib/utils';
import type { DashboardSummary, ServiceEndingFilter, ServiceListItem } from '@/types';

const PAGE_SIZE = 10;

type SortField = 'acesso' | 'customer__name' | 'operadora' | 'valor' | 'data_fim';
type EndingTab = ServiceEndingFilter | 'all';

/** Tab → `?ending=` value; "Todos" drops the parameter (dashboard links use the others). */
const ENDING_TABS: { value: EndingTab; label: string; count: (s: DashboardSummary) => number }[] = [
  { value: 'all', label: 'Todos', count: (s) => s.services.total },
  { value: '90', label: 'Até 90 dias', count: (s) => s.ending.within90 },
  { value: '180', label: 'Até 180 dias', count: (s) => s.ending.within180 },
  { value: '270', label: 'Até 270 dias', count: (s) => s.ending.within270 },
  { value: 'expired', label: 'Terminados', count: (s) => s.ending.expired },
];

function parseEnding(value: string | null): EndingTab {
  return ENDING_TABS.some((tab) => tab.value === value) ? (value as EndingTab) : 'all';
}

/** End date plus the urgency pill when it needs attention (ended or ≤ 90 days). */
function EndDate({ dataFim }: { dataFim: string | null }) {
  if (!dataFim) return <span className="text-muted-foreground">—</span>;
  const urgency = serviceEndUrgency(dataFim);
  return (
    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
      {urgency?.urgent && <StatusBadge tone={urgency.tone}>{urgency.label}</StatusBadge>}
      <span className="text-foreground-secondary">{formatServiceDate(dataFim)}</span>
    </div>
  );
}

export function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const ending = parseEnding(searchParams.get('ending'));
  const [searchInput, setSearchInput] = React.useState('');
  const search = useDebouncedValue(searchInput.trim(), 300);
  const [sort, setSort] = React.useState<SortHeadState<SortField>>(null);
  const [page, setPage] = React.useState(1);
  const { data: summary } = useDashboardSummary();

  // Any change to the query starts again from the first page.
  const [prevQuery, setPrevQuery] = React.useState({ search, ending });
  if (prevQuery.search !== search || prevQuery.ending !== ending) {
    setPrevQuery({ search, ending });
    setPage(1);
  }

  const ordering = sort ? `${sort.dir === 'desc' ? '-' : ''}${sort.field}` : undefined;
  const { data, isFetching, isError, error, refetch } = useServicesPage({
    search,
    ending: ending === 'all' ? undefined : ending,
    ordering,
    page,
  });

  const services = data?.items;
  const count = data?.count ?? 0;

  const handleEndingChange = (next: EndingTab) => {
    setSearchParams(
      (params) => {
        const updated = new URLSearchParams(params);
        if (next === 'all') updated.delete('ending');
        else updated.set('ending', next);
        return updated;
      },
      { replace: true },
    );
  };

  const handleSort = (field: SortField) => {
    setSort((current) => {
      if (current?.field !== field) return { field, dir: 'asc' };
      if (current.dir === 'asc') return { field, dir: 'desc' };
      return null;
    });
    setPage(1);
  };

  const tabs: ListTab<EndingTab>[] = ENDING_TABS.map((tab) => ({
    value: tab.value,
    label: tab.label,
    count: summary ? tab.count(summary) : null,
  }));

  return (
    <PageContainer>
      <PageHeader
        title="Serviços"
        description={
          summary ? (
            <span className="tabular-nums">
              {formatCount(summary.services.total)} serviços ·{' '}
              {formatCount(summary.services.active)} ativos ·{' '}
              {formatCurrency(summary.services.activeValue)}/mês
            </span>
          ) : (
            'Todos os serviços contratados pelos clientes, incluindo sub-serviços.'
          )
        }
      />

      <ListTabs
        value={ending}
        onValueChange={handleEndingChange}
        tabs={tabs}
        aria-label="Filtrar por data de fim"
        className="gap-6"
      >
        <div className="flex flex-col gap-6">
          <SearchField
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onClear={() => setSearchInput('')}
            placeholder="Acesso, operadora, tarifário, cliente…"
            aria-label="Procurar serviços"
            className="w-full sm:max-w-105"
          />

          <TableCard
            ivoryHead
            aria-label="Serviços"
            aria-busy={isFetching}
            className={cn('transition-opacity', isFetching && services && 'opacity-70')}
            footer={
              data && count > 0 ? (
                <Pagination
                  offset={(page - 1) * PAGE_SIZE}
                  pageSize={PAGE_SIZE}
                  total={count}
                  onChange={(offset) => setPage(offset / PAGE_SIZE + 1)}
                />
              ) : undefined
            }
          >
            {isError ? (
              <EmptyState
                tone="error"
                title="Não foi possível carregar os serviços."
                description={error.message}
                action={
                  <Button variant="outline" size="sm" onClick={() => void refetch()}>
                    Tentar novamente
                  </Button>
                }
              />
            ) : !services ? (
              <div className="flex flex-col gap-3 p-6" aria-busy>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : services.length === 0 ? (
              <EmptyState
                icon={<Package />}
                title={
                  search
                    ? 'Nenhum serviço corresponde à pesquisa.'
                    : ending !== 'all'
                      ? 'Nenhum serviço neste intervalo.'
                      : 'Ainda não há serviços.'
                }
                description={
                  !search && ending === 'all' ? 'Adicione-os na ficha de cada cliente.' : undefined
                }
                action={
                  search ? (
                    <Button variant="outline" size="sm" onClick={() => setSearchInput('')}>
                      Limpar pesquisa
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <Table inset className="min-w-160">
                <TableHeader>
                  <TableRow>
                    <SortableHead field="acesso" sort={sort} onSort={handleSort}>
                      Acesso
                    </SortableHead>
                    <SortableHead field="customer__name" sort={sort} onSort={handleSort}>
                      Cliente
                    </SortableHead>
                    <SortableHead field="operadora" sort={sort} onSort={handleSort}>
                      Operadora
                    </SortableHead>
                    <SortableHead
                      field="valor"
                      sort={sort}
                      onSort={handleSort}
                      className="hidden text-right md:table-cell"
                    >
                      Valor
                    </SortableHead>
                    <SortableHead
                      field="data_fim"
                      sort={sort}
                      onSort={handleSort}
                      className="text-right"
                    >
                      Data fim
                    </SortableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <ServiceRow key={service.id} service={service} />
                  ))}
                </TableBody>
              </Table>
            )}
          </TableCard>
        </div>
      </ListTabs>
    </PageContainer>
  );
}

function ServiceRow({ service }: { service: ServiceListItem }) {
  const isChild = service.parentId !== undefined;
  const showCompany = service.customerCompany && service.customerCompany !== service.customerName;
  return (
    <TableRow>
      <TableCell className="max-w-[30ch]">
        <div className="flex items-start gap-1.5">
          {isChild && (
            <CornerDownRight
              aria-hidden
              className="mt-0.5 size-3.5 shrink-0 text-foreground-tertiary"
            />
          )}
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="type-mono font-medium text-foreground">
              {isChild && <span className="sr-only">Sub-serviço: </span>}
              {service.acesso}
            </span>
            {service.tarifario && (
              <span className="truncate type-dense text-muted-foreground">{service.tarifario}</span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="max-w-[32ch]">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Link
            to={`/customers/${service.customerId}`}
            className="truncate rounded-xs font-medium text-foreground hover:underline"
          >
            {service.customerName}
          </Link>
          {showCompany && (
            <span className="truncate type-dense text-muted-foreground">
              {service.customerCompany}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-foreground-secondary">
        {service.operadora || <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="hidden text-right whitespace-nowrap md:table-cell">
        {formatCurrency(service.valor)}
        <span className="text-muted-foreground">/mês</span>
      </TableCell>
      <TableCell className="text-right">
        <EndDate dataFim={service.dataFim} />
      </TableCell>
    </TableRow>
  );
}
