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
import { Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientTable } from '@/components/shared/ClientTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchField } from '@/components/shared/SearchField';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableToolbar } from '@/components/shared/TableToolbar';
import { useServices } from '@/hooks/use-services';
import { getStatusTone } from '@/lib/status';
import { formatCurrency, getStatusLabel } from '@/lib/utils';
import type { Service } from '@/types';

// Catálogo (mock data layer): adding/editing services is not implemented yet,
// so the page is read-only — no create button or row actions.
const columns: ColumnDef<Service>[] = [
  {
    accessorKey: 'name',
    header: 'Serviço',
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
  },
  {
    accessorKey: 'description',
    header: 'Descrição',
    cell: ({ row }) => (
      <div className="max-w-[48ch] truncate text-foreground-secondary">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: 'price',
    header: () => <div className="text-right">Preço</div>,
    cell: ({ row }) => (
      <div className="text-right type-mono">
        {formatCurrency(row.original.price)}
        <span className="text-muted-foreground">
          {row.original.billingCycle === 'yearly' ? ' /ano' : ' /mês'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => (
      <StatusBadge tone={getStatusTone(row.original.status)}>
        {getStatusLabel(row.original.status)}
      </StatusBadge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Criado',
    cell: ({ row }) => (
      <span className="type-mono text-xs text-foreground-secondary">
        {new Date(row.original.createdAt).toLocaleDateString('pt-PT')}
      </span>
    ),
  },
];

export function ServicesPage() {
  const { data: services, isLoading } = useServices();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: services || [],
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

  const query = (table.getColumn('name')?.getFilterValue() as string) ?? '';
  const total = table.getFilteredRowModel().rows.length;

  return (
    <>
      <PageHeader
        title="Serviços"
        description="Catálogo de serviços disponíveis para os clientes."
      />

      <div className="flex flex-col gap-3 px-4 py-4 lg:px-6">
        <TableToolbar count={services ? `${total} serviço${total === 1 ? '' : 's'}` : undefined}>
          <SearchField
            value={query}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            onClear={() => table.getColumn('name')?.setFilterValue('')}
            placeholder="Procurar serviços…"
            aria-label="Procurar serviços"
            className="w-full sm:w-72"
          />
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
                icon={<Package />}
                title={query ? 'Nenhum serviço corresponde à pesquisa.' : 'Ainda não há serviços.'}
              />
            }
          />
        )}
      </div>
    </>
  );
}
