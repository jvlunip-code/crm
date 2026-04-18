import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  Search,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useAllNotifications,
  useDismissNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useMarkAsUnread,
  useUnreadCount,
} from '@/hooks/use-notifications'
import { renderNotification } from '@/lib/notifications/renderers'
import { flagBadgeClass, flagLabel } from '@/lib/notifications/flag-style'
import { formatRelativeTime } from '@/lib/utils'
import type { Notification } from '@/types'
import { toast } from 'sonner'

export function NotificationsPage() {
  const navigate = useNavigate()
  const { data: notifications, isLoading } = useAllNotifications()
  const { data: unreadCount = 0 } = useUnreadCount()
  const markAsRead = useMarkAsRead()
  const markAsUnread = useMarkAsUnread()
  const markAllRead = useMarkAllAsRead()
  const dismiss = useDismissNotification()

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'unread' | 'read'>('all')

  const filtered = React.useMemo(() => {
    if (!notifications) return []
    if (statusFilter === 'unread') return notifications.filter(n => !n.isRead)
    if (statusFilter === 'read') return notifications.filter(n => n.isRead)
    return notifications
  }, [notifications, statusFilter])

  const columns = React.useMemo<ColumnDef<Notification>[]>(() => [
    {
      id: 'flag',
      header: 'Estado',
      cell: ({ row }) => {
        const r = renderNotification(row.original)
        return (
          <Badge variant="outline" className={flagBadgeClass[r.flag]}>
            {flagLabel[r.flag]}
          </Badge>
        )
      },
    },
    {
      id: 'title',
      accessorFn: row => renderNotification(row).title,
      header: 'Título',
      cell: ({ row }) => <div className="font-medium">{renderNotification(row.original).title}</div>,
    },
    {
      id: 'message',
      accessorFn: row => renderNotification(row).message,
      header: 'Mensagem',
      cell: ({ row }) => (
        <div className="text-muted-foreground max-w-[400px] truncate">
          {renderNotification(row.original).message}
        </div>
      ),
    },
    {
      accessorKey: 'isRead',
      header: 'Lida',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.isRead ? (
            <CheckCircle2 className="fill-green-500 dark:fill-green-400 size-4" />
          ) : (
            <Circle className="size-4" />
          )}
          {row.original.isRead ? 'Lida' : 'Não lida'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Data',
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {formatRelativeTime(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const n = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
                onClick={e => e.stopPropagation()}
              >
                <MoreVertical />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
                  const href = renderNotification(n).href
                  if (!n.isRead) markAsRead.mutate(n.id)
                  navigate(href)
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
        )
      },
    },
  ], [markAsRead, markAsUnread, dismiss, navigate])

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
  })

  const handleRowClick = (n: Notification) => {
    if (!n.isRead) markAsRead.mutate(n.id)
    navigate(renderNotification(n).href)
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">A carregar notificações...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Notificações
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount} por ler</Badge>
                )}
              </CardTitle>
              <CardDescription>Ver e gerir as suas notificações</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Pesquisar notificações..."
                value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
                onChange={event =>
                  table.getColumn('title')?.setFilterValue(event.target.value)
                }
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as 'all' | 'unread' | 'read')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">Por ler</SelectItem>
                <SelectItem value="read">Lidas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      className={`cursor-pointer ${row.original.isRead ? '' : 'bg-muted/30'}`}
                      onClick={() => handleRowClick(row.original)}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Nenhuma notificação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              {table.getFilteredRowModel().rows.length} notificação(ões)
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Linhas por página
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={value => table.setPageSize(Number(value))}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map(pageSize => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
