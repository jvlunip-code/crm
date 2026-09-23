import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  MoreVertical,
  Plus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableToolbar } from '@/components/shared/TableToolbar';
import { CustomerDialog } from '@/components/customer/CustomerDialog';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { CustomerSearchCombobox } from '@/components/customer/CustomerSearchCombobox';
import { useCustomersPage, useDeleteCustomer } from '@/hooks/use-customers';
import { useDeleteTarget } from '@/hooks/use-delete-target';
import { getStatusTone } from '@/lib/status';
import { cn, formatNif, getStatusLabel } from '@/lib/utils';
import type { Customer } from '@/types';

const PAGE_SIZE = 10;

type SortField = 'name' | 'company' | 'status' | 'created_at';
type SortState = { field: SortField; dir: 'asc' | 'desc' } | null;

export function CustomersPage() {
  const [searchInput, setSearchInput] = React.useState('');
  const [submittedSearch, setSubmittedSearch] = React.useState('');
  const [sort, setSort] = React.useState<SortState>(null);
  const [page, setPage] = React.useState(1);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | undefined>();

  const ordering = sort ? `${sort.dir === 'desc' ? '-' : ''}${sort.field}` : undefined;
  const { data, isFetching, isError, error, refetch } = useCustomersPage({
    search: submittedSearch,
    ordering,
    page,
  });
  const deleteCustomer = useDeleteCustomer();

  const customers = data?.items;
  const count = data?.count ?? 0;

  const handleSubmitSearch = () => {
    setSubmittedSearch(searchInput.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSubmittedSearch('');
    setPage(1);
  };

  // Click cycles: asc → desc → off (back to relevance/newest order)
  const handleSort = (field: SortField) => {
    setSort((current) => {
      if (current?.field !== field) return { field, dir: 'asc' };
      if (current.dir === 'asc') return { field, dir: 'desc' };
      return null;
    });
    setPage(1);
  };

  const handleCreate = () => {
    setEditingCustomer(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  const pendingDelete = useDeleteTarget<Customer>();
  const confirmDelete = async () => {
    if (!pendingDelete.target) return;
    await deleteCustomer.mutateAsync(pendingDelete.target.id);
    toast.success('Cliente eliminado');
  };

  return (
    <>
      <PageHeader
        title="Clientes"
        description="A carteira de clientes e os respetivos contactos, serviços e documentos."
        actions={
          <Button onClick={handleCreate}>
            <Plus aria-hidden />
            Adicionar cliente
          </Button>
        }
      />

      <div className="flex flex-col gap-3 px-4 py-4 lg:px-6">
        <TableToolbar count={data ? `${count} cliente${count === 1 ? '' : 's'}` : undefined}>
          {/* Server-side full-text search: runs on submit, not per keystroke. */}
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmitSearch();
            }}
            className="flex w-full min-w-0 items-center gap-2 sm:w-auto"
          >
            <CustomerSearchCombobox
              value={searchInput}
              onChange={setSearchInput}
              onClear={handleClearSearch}
              className="w-full sm:w-96"
            />
            <Button type="submit" variant="outline">
              Pesquisar
            </Button>
          </form>
        </TableToolbar>

        <Card
          className={cn('py-0 transition-opacity', isFetching && customers && 'opacity-70')}
          aria-busy={isFetching}
        >
          {isError ? (
            <EmptyState
              tone="error"
              title="Não foi possível carregar os clientes."
              description={error.message}
              action={
                <Button variant="outline" size="sm" onClick={() => void refetch()}>
                  Tentar novamente
                </Button>
              }
            />
          ) : !customers ? (
            <div className="flex flex-col gap-3 p-4" aria-busy>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <EmptyState
              icon={<Users />}
              title={
                submittedSearch
                  ? 'Nenhum cliente corresponde à pesquisa.'
                  : 'Ainda não há clientes. Crie o primeiro com «Adicionar cliente».'
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead field="name" sort={sort} onSort={handleSort}>
                    Nome
                  </SortableHead>
                  <SortableHead field="company" sort={sort} onSort={handleSort}>
                    Empresa
                  </SortableHead>
                  <TableHead className="hidden lg:table-cell">Contacto</TableHead>
                  <TableHead className="hidden md:table-cell">NIF</TableHead>
                  <SortableHead
                    field="created_at"
                    sort={sort}
                    onSort={handleSort}
                    className="hidden md:table-cell"
                  >
                    Criado
                  </SortableHead>
                  <SortableHead field="status" sort={sort} onSort={handleSort}>
                    Estado
                  </SortableHead>
                  <TableHead className="w-16">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="max-w-[32ch] truncate font-medium">
                      <Link
                        to={`/customers/${customer.id}`}
                        className="rounded-xs text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[28ch] truncate text-foreground-secondary">
                      {customer.company || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="hidden max-w-[36ch] truncate text-foreground-secondary lg:table-cell">
                      {[customer.email, customer.phone].filter(Boolean).join(' · ') || '—'}
                    </TableCell>
                    <TableCell className="hidden type-mono text-xs text-foreground-secondary md:table-cell">
                      {formatNif(customer.nif)}
                    </TableCell>
                    <TableCell className="hidden type-mono text-xs text-foreground-secondary md:table-cell">
                      {new Date(customer.createdAt).toLocaleDateString('pt-PT')}
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={getStatusTone(customer.status)}>
                        {getStatusLabel(customer.status)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Ações para ${customer.name}`}
                            >
                              <MoreVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={() => handleEdit(customer)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => pendingDelete.request(customer)}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Abrir ${customer.name}`}
                        >
                          <Link to={`/customers/${customer.id}`}>
                            <ArrowUpRight />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Server-side pagination: 10 per page. */}
        {data && count > PAGE_SIZE && (
          <Pagination
            offset={(page - 1) * PAGE_SIZE}
            pageSize={PAGE_SIZE}
            total={count}
            onChange={(offset) => setPage(offset / PAGE_SIZE + 1)}
          />
        )}
      </div>

      <CustomerDialog customer={editingCustomer} open={dialogOpen} onOpenChange={setDialogOpen} />
      <ConfirmDeleteDialog
        open={pendingDelete.open}
        onOpenChange={pendingDelete.setOpen}
        title={`Eliminar ${pendingDelete.target?.name ?? 'cliente'}?`}
        description="O cliente e todos os seus serviços, documentos, contactos e morada serão eliminados permanentemente. Esta ação não pode ser anulada."
        confirmLabel="Eliminar cliente"
        onConfirm={confirmDelete}
      />
    </>
  );
}

/** Column header that cycles its field's sort: asc → desc → off. */
function SortableHead({
  field,
  sort,
  onSort,
  className,
  children,
}: {
  field: SortField;
  sort: SortState;
  onSort: (field: SortField) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const dir = sort?.field === field ? sort.dir : null;
  const Icon = dir === 'asc' ? ArrowUp : dir === 'desc' ? ArrowDown : ArrowUpDown;
  return (
    <TableHead
      className={className}
      aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className="-mx-1 inline-flex items-center gap-1 rounded-xs px-1 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {children}
        <Icon
          aria-hidden
          className={cn('size-3.5', dir ? 'text-foreground' : 'text-muted-foreground/60')}
        />
      </button>
    </TableHead>
  );
}
