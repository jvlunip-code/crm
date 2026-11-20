import * as React from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
import { Activity } from 'lucide-react';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientTable } from '@/components/shared/ClientTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { InitialsAvatar } from '@/components/shared/InitialsAvatar';
import { ListTabs, type ListTab } from '@/components/shared/ListTabs';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchField } from '@/components/shared/SearchField';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableCard } from '@/components/shared/TableCard';
import { useEvents } from '@/hooks/use-events';
import { formatDateTime } from '@/lib/utils';
import type { Event } from '@/types';

/** Event action → label and tone (the label carries the meaning). */
const ACTIONS: Record<string, { label: string; tone: BadgeTone }> = {
  create: { label: 'Criação', tone: 'success' },
  update: { label: 'Atualização', tone: 'info' },
  delete: { label: 'Eliminação', tone: 'error' },
  activate: { label: 'Ativação', tone: 'success' },
  deactivate: { label: 'Desativação', tone: 'warning' },
  config: { label: 'Configuração', tone: 'note' },
};

const ENTITY_LABELS: Record<Event['entityType'], string> = {
  customer: 'Cliente',
  service: 'Serviço',
  notification: 'Notificação',
  system: 'Sistema',
};

type EntityFilter = 'all' | Exclude<Event['entityType'], 'system'>;

const ENTITY_TABS: { value: EntityFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'customer', label: 'Clientes' },
  { value: 'service', label: 'Serviços' },
  { value: 'notification', label: 'Notificações' },
];

/** Stable avatar fill for a name (events carry no user id). */
function nameSeed(name: string): number {
  let seed = 0;
  for (const char of name) seed = (seed + char.charCodeAt(0)) % 997;
  return seed;
}

const columns: ColumnDef<Event>[] = [
  {
    accessorKey: 'action',
    header: 'Ação',
    cell: ({ row }) => {
      const action = ACTIONS[row.original.action];
      return (
        <StatusBadge tone={action?.tone ?? 'neutral'}>
          {action?.label ?? row.original.action}
        </StatusBadge>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Descrição',
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="max-w-[56ch] truncate text-foreground">{row.original.description}</span>
        <span className="type-dense text-muted-foreground tabular-nums">
          {ENTITY_LABELS[row.original.entityType] ?? row.original.entityType} #
          {row.original.entityId}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'performedBy',
    header: 'Executado por',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <InitialsAvatar
          name={row.original.performedBy}
          id={nameSeed(row.original.performedBy)}
          size="sm"
        />
        <span className="whitespace-nowrap text-foreground-secondary">
          {row.original.performedBy}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Data/hora',
    meta: { className: 'text-right' },
    cell: ({ row }) => (
      <span className="whitespace-nowrap type-dense text-muted-foreground">
        {formatDateTime(row.original.createdAt)}
      </span>
    ),
  },
];

export function EventsPage() {
  const { data: events, isLoading } = useEvents();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [entityTypeFilter, setEntityTypeFilter] = React.useState<EntityFilter>('all');

  const filteredEvents = React.useMemo(() => {
    if (!events) return [];
    if (entityTypeFilter === 'all') return events;
    return events.filter((e) => e.entityType === entityTypeFilter);
  }, [events, entityTypeFilter]);

  const tabs: ListTab<EntityFilter>[] = ENTITY_TABS.map((tab) => ({
    ...tab,
    count: !events
      ? null
      : tab.value === 'all'
        ? events.length
        : events.filter((e) => e.entityType === tab.value).length,
  }));

  const table = useReactTable({
    data: filteredEvents,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const query = (table.getColumn('description')?.getFilterValue() as string) ?? '';
  const setQuery = (value: string) => {
    table.getColumn('description')?.setFilterValue(value);
    table.setPageIndex(0);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Eventos"
        meta={<Badge tone="chip">Dados de demonstração</Badge>}
        description="Registo das ações sobre clientes, serviços e notificações."
      />

      <ListTabs
        value={entityTypeFilter}
        onValueChange={(value) => {
          setEntityTypeFilter(value);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        tabs={tabs}
        aria-label="Filtrar por entidade"
        className="gap-6"
      >
        <div className="flex flex-col gap-6">
          <SearchField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery('')}
            placeholder="Procurar eventos…"
            aria-label="Procurar eventos"
            className="w-full sm:max-w-105"
          />

          {isLoading ? (
            <TableCard aria-busy>
              <div className="flex flex-col gap-3 p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            </TableCard>
          ) : (
            <ClientTable
              table={table}
              tableClassName="min-w-160"
              empty={
                <EmptyState
                  icon={<Activity />}
                  title={
                    query || entityTypeFilter !== 'all'
                      ? 'Nenhum evento corresponde ao filtro.'
                      : 'Ainda não há eventos registados.'
                  }
                />
              }
            />
          )}
        </div>
      </ListTabs>
    </PageContainer>
  );
}
