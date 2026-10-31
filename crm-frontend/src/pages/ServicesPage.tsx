import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CornerDownRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { SearchField } from '@/components/shared/SearchField';
import { SortableHead, type SortHeadState } from '@/components/shared/SortableHead';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableToolbar } from '@/components/shared/TableToolbar';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useServicesPage } from '@/hooks/use-services-list';
import { cn, formatCurrency, formatServiceDate } from '@/lib/utils';
import type { ServiceEndingFilter, ServiceListItem } from '@/types';

const PAGE_SIZE = 10;

type SortField = 'acesso' | 'customer__name' | 'operadora' | 'valor' | 'data_fim';

const ENDING_FILTERS: { value: ServiceEndingFilter; label: string }[] = [
  { value: 'expired', label: 'Terminados' },
  { value: '90', label: 'Até 90 dias' },
  { value: '180', label: 'Até 180 dias' },
  { value: '270', label: 'Até 270 dias' },
];

/** Days from today (local) to a "YYYY-MM-DD" end date. */
function daysUntil(dataFim: string): number {
  const [y, m, d] = dataFim.split('-').map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / 86_400_000);
}

/** End date plus a badge when it needs attention (same 90-day window as notifications). */
function EndDate({ dataFim }: { dataFim: string | null }) {
  if (!dataFim) return <span className="text-muted-foreground">—</span>;
  const days = daysUntil(dataFim);
  return (
    <div className="flex items-center gap-2">
      <span className="type-mono text-xs text-foreground-secondary">
        {formatServiceDate(dataFim)}
      </span>
      {days < 0 ? (
        <StatusBadge tone="error">Terminado</StatusBadge>
      ) : days <= 90 ? (
        <StatusBadge tone="warning">{days === 0 ? 'Hoje' : `${days} dias`}</StatusBadge>
      ) : null}
    </div>
  );
}

export function ServicesPage() {
  const [searchInput, setSearchInput] = React.useState('');
  const search = useDebouncedValue(searchInput.trim(), 300);
  const [ending, setEnding] = React.useState<ServiceEndingFilter | ''>('');
  const [sort, setSort] = React.useState<SortHeadState<SortField>>(null);
  const [page, setPage] = React.useState(1);

  // Any change to the query starts again from the first page.
  const [prevQuery, setPrevQuery] = React.useState({ search, ending });
  if (prevQuery.search !== search || prevQuery.ending !== ending) {
    setPrevQuery({ search, ending });
    setPage(1);
  }

  const ordering = sort ? `${sort.dir === 'desc' ? '-' : ''}${sort.field}` : undefined;
  const { data, isFetching, isError, error, refetch } = useServicesPage({
    search,
    ending: ending || undefined,
    ordering,
    page,
  });

  const services = data?.items;
  const count = data?.count ?? 0;
  const filtered = Boolean(search || ending);

  const handleSort = (field: SortField) => {
    setSort((current) => {
      if (current?.field !== field) return { field, dir: 'asc' };
      if (current.dir === 'asc') return { field, dir: 'desc' };
      return null;
    });
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Serviços"
        description="Todos os serviços contratados pelos clientes, incluindo sub-serviços."
      />

      <div className="flex flex-col gap-3 px-4 py-4 lg:px-6">
        <TableToolbar count={data ? `${count} serviço${count === 1 ? '' : 's'}` : undefined}>
          <SearchField
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onClear={() => setSearchInput('')}
            placeholder="Acesso, operadora, tarifário, cliente…"
            aria-label="Procurar serviços"
            className="w-full sm:w-80"
          />
          <ToggleGroup
            type="single"
            variant="outline"
            value={ending}
            onValueChange={(value) => setEnding(value as ServiceEndingFilter | '')}
            aria-label="Filtrar por data de fim"
            className="flex-wrap"
          >
            {ENDING_FILTERS.map((filter) => (
              <ToggleGroupItem key={filter.value} value={filter.value}>
                {filter.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </TableToolbar>

        <Card
          className={cn('py-0 transition-opacity', isFetching && services && 'opacity-70')}
          aria-busy={isFetching}
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
            <div className="flex flex-col gap-3 p-4" aria-busy>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <EmptyState
              icon={<Package />}
              title={
                filtered
                  ? 'Nenhum serviço corresponde aos filtros.'
                  : 'Ainda não há serviços. Adicione-os na ficha de cada cliente.'
              }
            />
          ) : (
            <Table>
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
                  <TableHead className="hidden lg:table-cell">Tarifário</TableHead>
                  <SortableHead
                    field="valor"
                    sort={sort}
                    onSort={handleSort}
                    className="hidden text-right md:table-cell"
                  >
                    Valor
                  </SortableHead>
                  <SortableHead field="data_fim" sort={sort} onSort={handleSort}>
                    Data fim
                  </SortableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Abrir cliente</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <ServiceRow key={service.id} service={service} />
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {data && count > PAGE_SIZE && (
          <Pagination
            offset={(page - 1) * PAGE_SIZE}
            pageSize={PAGE_SIZE}
            total={count}
            onChange={(offset) => setPage(offset / PAGE_SIZE + 1)}
          />
        )}
      </div>
    </>
  );
}

function ServiceRow({ service }: { service: ServiceListItem }) {
  const isChild = service.parentId !== undefined;
  const showCompany = service.customerCompany && service.customerCompany !== service.customerName;
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-1.5">
          {isChild && (
            <CornerDownRight
              aria-label="Sub-serviço"
              className="size-3.5 shrink-0 text-muted-foreground"
            />
          )}
          <span className="type-mono">{service.acesso}</span>
        </div>
      </TableCell>
      <TableCell className="max-w-[32ch]">
        <Link
          to={`/customers/${service.customerId}`}
          className="block truncate rounded-xs text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {service.customerName}
        </Link>
        {showCompany && (
          <div className="truncate type-caption text-muted-foreground">
            {service.customerCompany}
          </div>
        )}
      </TableCell>
      <TableCell className="text-foreground-secondary">{service.operadora}</TableCell>
      <TableCell className="hidden max-w-[28ch] truncate text-foreground-secondary lg:table-cell">
        {service.tarifario || <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="hidden text-right type-mono md:table-cell">
        {formatCurrency(service.valor)}
      </TableCell>
      <TableCell>
        <EndDate dataFim={service.dataFim} />
      </TableCell>
      <TableCell className="text-right">
        <Button asChild variant="ghost" size="icon-xs" aria-label={`Abrir ${service.customerName}`}>
          <Link to={`/customers/${service.customerId}`}>
            <ArrowUpRight />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
