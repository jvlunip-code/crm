import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type HeaderContext,
  type SortingState,
} from '@tanstack/react-table';
import { Bell, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientTable } from '@/components/shared/ClientTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListTabs, type ListTab } from '@/components/shared/ListTabs';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchField } from '@/components/shared/SearchField';
import { SortHeaderButton } from '@/components/shared/SortableHead';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableCard } from '@/components/shared/TableCard';
import {
  useAllNotifications,
  useDismissNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useMarkAsUnread,
  useUnreadCount,
} from '@/hooks/use-notifications';
import { renderNotification } from '@/lib/notifications/renderers';
import { FLAG } from '@/lib/notifications/flag-style';
import { STATUS_DOT, getStatusTone } from '@/lib/status';
import { PAGE_SIZE_ALL, readStoredPageSize, storePageSize } from '@/lib/pagination';
import { cn, formatRelativeTime, formatServiceDate } from '@/lib/utils';
import type { Notification } from '@/types';
import { toast } from 'sonner';

const PAGE_SIZE_OPTIONS = [20, 50, 100, 150, PAGE_SIZE_ALL];
const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_STORAGE_KEY = 'crm.notifications.pageSize';

type ReadFilter = 'all' | 'unread' | 'read';

/** Tab ↔ `?estado=` value ("Todas" is the default and drops the parameter). */
const ESTADO_PARAM: Record<ReadFilter, string | null> = {
  all: null,
  unread: 'por-ler',
  read: 'lidas',
};

function parseEstado(value: string | null): ReadFilter {
  if (value === ESTADO_PARAM.unread) return 'unread';
  if (value === ESTADO_PARAM.read) return 'read';
  return 'all';
}

/** Urgency = the service end date (ISO, so text order is date order); missing sorts last. */
const serviceEnd = (n: Notification) => n.metadata?.serviceDataFim || undefined;

/** Text the search matches: the service access code and the customer name. */
const serviceText = (n: Notification) =>
  `${n.metadata?.serviceAcesso ?? ''} ${n.metadata?.customerName ?? ''}`;

/** Most urgent first: soonest-ending (and already expired) services at the top. */
const URGENCY_SORT: SortingState = [{ id: 'dataFim', desc: false }];

const UNREAD_DOT = STATUS_DOT[getStatusTone('unread')];

function sortableHeader(label: string) {
  return function SortableHeader({ column }: HeaderContext<Notification, unknown>) {
    return (
      <SortHeaderButton dir={column.getIsSorted()} onClick={column.getToggleSortingHandler()}>
        {label}
      </SortHeaderButton>
    );
  };
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = parseEstado(searchParams.get('estado'));
  const { data: notifications, isLoading, isError, error, refetch } = useAllNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAsUnread = useMarkAsUnread();
  const markAllRead = useMarkAllAsRead();
  const dismiss = useDismissNotification();

  const [sorting, setSorting] = React.useState<SortingState>(URGENCY_SORT);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState(() => ({
    pageIndex: 0,
    pageSize: readStoredPageSize(PAGE_SIZE_STORAGE_KEY, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE),
  }));

  const filtered = React.useMemo(() => {
    if (!notifications) return [];
    if (statusFilter === 'unread') return notifications.filter((n) => !n.isRead);
    if (statusFilter === 'read') return notifications.filter((n) => n.isRead);
    return notifications;
  }, [notifications, statusFilter]);

  const tabs = React.useMemo<ListTab<ReadFilter>[]>(() => {
    const unread = notifications?.filter((n) => !n.isRead).length;
    return [
      { value: 'all', label: 'Todas', count: notifications?.length ?? null },
      { value: 'unread', label: 'Por ler', count: unread ?? null },
      {
        value: 'read',
        label: 'Lidas',
        count: notifications && unread !== undefined ? notifications.length - unread : null,
      },
    ];
  }, [notifications]);

  const columns = React.useMemo<ColumnDef<Notification>[]>(
    () => [
      {
        id: 'flag',
        accessorFn: serviceEnd,
        sortUndefined: 'last',
        header: sortableHeader('Estado'),
        cell: ({ row }) => {
          const r = renderNotification(row.original);
          return <StatusBadge tone={FLAG[r.flag].tone}>{FLAG[r.flag].label}</StatusBadge>;
        },
      },
      {
        id: 'service',
        accessorFn: serviceText,
        enableSorting: false,
        header: 'Serviço',
        cell: ({ row }) => {
          const n = row.original;
          return (
            <div className="flex min-w-0 items-start gap-2">
              <span
                aria-hidden
                className={cn(
                  'mt-1.75 size-1.5 shrink-0 rounded-full',
                  n.isRead ? 'bg-transparent' : UNREAD_DOT,
                )}
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span
                  className={cn(
                    'type-mono text-foreground',
                    n.isRead ? 'font-normal' : 'font-medium',
                  )}
                >
                  {n.metadata.serviceAcesso}
                  {!n.isRead && <span className="sr-only">, por ler</span>}
                </span>
                <span className="max-w-[40ch] truncate type-dense text-muted-foreground">
                  {n.metadata.customerName}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'dataFim',
        accessorFn: serviceEnd,
        sortUndefined: 'last',
        header: sortableHeader('Termina'),
        meta: { className: 'text-right' },
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-foreground-secondary">
            {formatServiceDate(serviceEnd(row.original))}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        sortDescFirst: true,
        header: sortableHeader('Criada'),
        meta: { className: 'text-right' },
        cell: ({ row }) => (
          <span className="whitespace-nowrap type-dense text-muted-foreground">
            {formatRelativeTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Ações</span>,
        cell: ({ row }) => {
          const n = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Ações: ${n.metadata.serviceAcesso}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    onSelect={() =>
                      (n.isRead ? markAsUnread : markAsRead)
                        .mutateAsync(n.id)
                        .catch(() => toast.error('Erro ao atualizar notificação'))
                    }
                  >
                    {n.isRead ? 'Marcar como não lida' : 'Marcar como lida'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      const href = renderNotification(n).href;
                      if (!n.isRead) markAsRead.mutate(n.id);
                      navigate(href);
                    }}
                  >
                    Ver cliente
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() =>
                      dismiss
                        .mutateAsync(n.id)
                        .catch(() => toast.error('Erro ao ignorar notificação'))
                    }
                  >
                    Ignorar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [markAsRead, markAsUnread, dismiss, navigate],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleRowClick = (n: Notification) => {
    if (!n.isRead) markAsRead.mutate(n.id);
    navigate(renderNotification(n).href);
  };

  const handleStatusChange = (next: ReadFilter) => {
    setSearchParams(
      (params) => {
        const updated = new URLSearchParams(params);
        const value = ESTADO_PARAM[next];
        if (value) updated.set('estado', value);
        else updated.delete('estado');
        return updated;
      },
      { replace: true },
    );
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const query = (table.getColumn('service')?.getFilterValue() as string) ?? '';
  const setQuery = (value: string) => {
    table.getColumn('service')?.setFilterValue(value);
    table.setPageIndex(0);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Notificações"
        description="Serviços a terminar, por ordem de urgência."
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              markAllRead
                .mutateAsync()
                .then(() => toast.success('Notificações marcadas como lidas'))
                .catch(() => toast.error('Erro ao marcar como lidas'))
            }
            disabled={unreadCount === 0 || markAllRead.isPending}
          >
            Marcar todas como lidas
          </Button>
        }
      />

      <ListTabs
        value={statusFilter}
        onValueChange={handleStatusChange}
        tabs={tabs}
        aria-label="Filtrar por estado de leitura"
        className="gap-6"
      >
        <div className="flex flex-col gap-6">
          <SearchField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery('')}
            placeholder="Procurar por acesso ou cliente"
            aria-label="Procurar notificações"
            className="w-full sm:max-w-105"
          />

          {isError ? (
            <TableCard>
              <EmptyState
                tone="error"
                title="Não foi possível carregar as notificações."
                description={error.message}
                action={
                  <Button variant="outline" size="sm" onClick={() => void refetch()}>
                    Tentar novamente
                  </Button>
                }
              />
            </TableCard>
          ) : isLoading ? (
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
              onRowClick={(row) => handleRowClick(row.original)}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageSizeChange={(size) => storePageSize(PAGE_SIZE_STORAGE_KEY, size)}
              tableClassName="min-w-160"
              empty={
                <EmptyState
                  icon={<Bell />}
                  title={
                    query || statusFilter !== 'all'
                      ? 'Nenhuma notificação corresponde ao filtro.'
                      : 'Sem notificações.'
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
