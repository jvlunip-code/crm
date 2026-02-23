import * as React from 'react'
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
  Search,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Package,
  Settings,
  Activity,
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
import { useEvents } from '@/hooks/use-events'
import type { Event } from '@/types'

const actionIcons: Record<string, React.ElementType> = {
  create: UserPlus,
  update: Edit,
  delete: Trash2,
  activate: Package,
  deactivate: UserMinus,
  config: Settings,
  default: Activity,
}

const actionColors: Record<string, string> = {
  create: 'text-green-500',
  update: 'text-blue-500',
  delete: 'text-destructive',
  activate: 'text-green-500',
  deactivate: 'text-yellow-500',
  config: 'text-purple-500',
  default: 'text-muted-foreground',
}

const columns: ColumnDef<Event>[] = [
  {
    accessorKey: 'action',
    header: 'Ação',
    cell: ({ row }) => {
      const action = row.original.action
      const Icon = actionIcons[action] || actionIcons.default
      const color = actionColors[action] || actionColors.default
      return (
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <Badge variant="outline" className="capitalize">
            {action}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'entityType',
    header: 'Tipo de Entidade',
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.original.entityType}
      </Badge>
    ),
  },
  {
    accessorKey: 'entityId',
    header: 'ID da Entidade',
    cell: ({ row }) => (
      <div className="text-muted-foreground font-mono text-sm">
        #{row.original.entityId}
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Descrição',
    cell: ({ row }) => (
      <div className="max-w-[400px] truncate">{row.original.description}</div>
    ),
  },
  {
    accessorKey: 'performedBy',
    header: 'Executado Por',
    cell: ({ row }) => (
      <div className="font-medium">{row.original.performedBy}</div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Data/Hora',
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm">
        {new Date(row.original.createdAt).toLocaleString('pt-PT')}
      </div>
    ),
  },
]

export function EventsPage() {
  const { data: events, isLoading } = useEvents()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [entityTypeFilter, setEntityTypeFilter] = React.useState<string>('all')

  const filteredEvents = React.useMemo(() => {
    if (!events) return []
    if (entityTypeFilter === 'all') return events
    return events.filter((e) => e.entityType === entityTypeFilter)
  }, [events, entityTypeFilter])

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
  })

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">A carregar eventos...</div>
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
                <Activity className="h-5 w-5" />
                Eventos do Sistema
              </CardTitle>
              <CardDescription>
                Registar todas as ações realizadas no sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Pesquisar eventos..."
                value={
                  (table.getColumn('description')?.getFilterValue() as string) ?? ''
                }
                onChange={(event) =>
                  table.getColumn('description')?.setFilterValue(event.target.value)
                }
                className="pl-9"
              />
            </div>
            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="customer">Clientes</SelectItem>
                <SelectItem value="service">Serviços</SelectItem>
                <SelectItem value="notification">Notificações</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Nenhum evento encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              {table.getFilteredRowModel().rows.length} evento(s)
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Linhas por página
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
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
                  Página {table.getState().pagination.pageIndex + 1} de{' '}
                  {table.getPageCount()}
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
