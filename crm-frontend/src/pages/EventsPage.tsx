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
import type { BadgeTone } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientTable } from '@/components/shared/ClientTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchField } from '@/components/shared/SearchField';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableToolbar } from '@/components/shared/TableToolbar';
import { useEvents } from '@/hooks/use-events';
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
    accessorKey: 'entityType',
    header: 'Entidade',
    cell: ({ row }) => (
      <span className="text-foreground-secondary">
        {ENTITY_LABELS[row.original.entityType] ?? row.original.entityType}{' '}
        <span className="type-mono text-xs text-muted-foreground">#{row.original.entityId}</span>
      </span>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Descrição',
    cell: ({ row }) => (
      <div className="max-w-[56ch] truncate text-foreground">{row.original.description}</div>
    ),
  },
  {
    accessorKey: 'performedBy',
    header: 'Executado por',
    cell: ({ row }) => (
      <span className="text-foreground-secondary">{row.original.performedBy}</span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Data/hora',
    cell: ({ row }) => (
      <span className="type-mono text-xs whitespace-nowrap text-foreground-secondary">
        {new Date(row.original.createdAt).toLocaleString('pt-PT')}
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
  const [entityTypeFilter, setEntityTypeFilter] = React.useState<string>('all');

  const filteredEvents = React.useMemo(() => {
    if (!events) return [];
    if (entityTypeFilter === 'all') return events;
    return events.filter((e) => e.entityType === entityTypeFilter);
  }, [events, entityTypeFilter]);

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
  const total = table.getFilteredRowModel().rows.length;

  return (
    <>
      <PageHeader
        title="Eventos"
        description="Registo das ações realizadas no sistema sobre clientes, serviços e notificações."
      />

      <div className="flex flex-col gap-3 px-4 py-4 lg:px-6">
        <TableToolbar count={events ? `${total} evento${total === 1 ? '' : 's'}` : undefined}>
          <SearchField
            value={query}
            onChange={(event) => table.getColumn('description')?.setFilterValue(event.target.value)}
            onClear={() => table.getColumn('description')?.setFilterValue('')}
            placeholder="Procurar eventos…"
            aria-label="Procurar eventos"
            className="w-full sm:w-72"
          />
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-40" aria-label="Filtrar por entidade">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as entidades</SelectItem>
              <SelectItem value="customer">Clientes</SelectItem>
              <SelectItem value="service">Serviços</SelectItem>
              <SelectItem value="notification">Notificações</SelectItem>
            </SelectContent>
          </Select>
        </TableToolbar>

        {isLoading ? (
          <div className="flex flex-col gap-3" aria-busy>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : (
          <ClientTable
            table={table}
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
    </>
  );
}
