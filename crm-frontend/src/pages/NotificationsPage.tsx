import * as React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Bell, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { getStatusTone } from '@/lib/status';
import { formatRelativeTime } from '@/lib/utils';
import type { Notification } from '@/types';
import { toast } from 'sonner';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useAllNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAsUnread = useMarkAsUnread();
  const markAllRead = useMarkAllAsRead();
  const dismiss = useDismissNotification();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'unread' | 'read'>('all');

  const filtered = React.useMemo(() => {
    if (!notifications) return [];
    if (statusFilter === 'unread') return notifications.filter((n) => !n.isRead);
    if (statusFilter === 'read') return notifications.filter((n) => n.isRead);
    return notifications;
  }, [notifications, statusFilter]);

  const columns = React.useMemo<ColumnDef<Notification>[]>(
    () => [
      {
        id: 'flag',
        header: 'Estado',
        cell: ({ row }) => {
          const r = renderNotification(row.original);
          return <StatusBadge tone={FLAG[r.flag].tone}>{FLAG[r.flag].label}</StatusBadge>;
        },
      },
      {
        id: 'title',
        accessorFn: (row) => renderNotification(row).title,
        header: 'Título',
        cell: ({ row }) => (
          <span className={row.original.isRead ? 'text-foreground' : 'font-medium text-foreground'}>
            {renderNotification(row.original).title}
          </span>
        ),
      },
      {
        id: 'message',
        accessorFn: (row) => renderNotification(row).message,
        header: 'Mensagem',
        cell: ({ row }) => (
          <div className="max-w-[48ch] truncate text-foreground-secondary">
            {renderNotification(row.original).message}
          </div>
        ),
      },
      {
        accessorKey: 'isRead',
        header: 'Lida',
        cell: ({ row }) => (
          <StatusBadge tone={getStatusTone(row.original.isRead ? 'read' : 'unread')}>
            {row.original.isRead ? 'Lida' : 'Por ler'}
          </StatusBadge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Data',
        cell: ({ row }) => (
          <span className="whitespace-nowrap type-caption text-muted-foreground">
            {formatRelativeTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const n = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Ações da notificação"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
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

  const query = (table.getColumn('title')?.getFilterValue() as string) ?? '';
  const total = table.getFilteredRowModel().rows.length;

  return (
    <>
      <PageHeader
        title="Notificações"
        meta={unreadCount > 0 && <StatusBadge tone="info">{unreadCount} por ler</StatusBadge>}
        description="Serviços a terminar e outros avisos sobre a carteira de clientes."
        actions={
          <Button
            variant="outline"
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

      <div className="flex flex-col gap-3 px-4 py-4 lg:px-6">
        <TableToolbar
          count={notifications ? `${total} notificaç${total === 1 ? 'ão' : 'ões'}` : undefined}
        >
          <SearchField
            value={query}
            onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
            onClear={() => table.getColumn('title')?.setFilterValue('')}
            placeholder="Procurar notificações…"
            aria-label="Procurar notificações"
            className="w-full sm:w-72"
          />
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as 'all' | 'unread' | 'read')}
          >
            <SelectTrigger className="w-36" aria-label="Filtrar por estado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="unread">Por ler</SelectItem>
              <SelectItem value="read">Lidas</SelectItem>
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
            onRowClick={(row) => handleRowClick(row.original)}
            rowClassName={(row) => (row.original.isRead ? undefined : 'bg-selection/60')}
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
    </>
  );
}
