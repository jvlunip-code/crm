import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Plus,
  Search,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomersPage, useDeleteCustomer } from '@/hooks/use-customers';
import { CustomerDialog } from '@/components/customer/CustomerDialog';
import type { Customer } from '@/types';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

type SortField = 'name' | 'company' | 'status' | 'created_at';
type SortState = { field: SortField; dir: 'asc' | 'desc' } | null;

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Nome' },
  { field: 'company', label: 'Empresa' },
  { field: 'status', label: 'Estado' },
  { field: 'created_at', label: 'Criado' },
];

export function CustomersPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = React.useState('');
  const [submittedSearch, setSubmittedSearch] = React.useState('');
  const [sort, setSort] = React.useState<SortState>(null);
  const [page, setPage] = React.useState(1);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | undefined>();

  const ordering = sort ? `${sort.dir === 'desc' ? '-' : ''}${sort.field}` : undefined;
  const { data, isFetching } = useCustomersPage({ search: submittedSearch, ordering, page });
  const deleteCustomer = useDeleteCustomer();

  const customers = data?.items;
  const count = data?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));

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

  const handleDelete = async (id: number) => {
    try {
      await deleteCustomer.mutateAsync(id);
      toast.success('Cliente eliminado com sucesso');
    } catch {
      toast.error('Erro ao eliminar cliente');
    }
  };

  return (
    <div className="w-full space-y-4 p-4 lg:p-6">
      {/* Filter bar: search + count on the left, create on the right. */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmitSearch();
        }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Procurar por nome, empresa, NIF, email ou morada…"
            className="pl-9"
            aria-label="Procurar clientes"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">
          Pesquisar
        </Button>
        {submittedSearch && (
          <Button type="button" variant="ghost" size="sm" onClick={handleClearSearch}>
            Limpar
          </Button>
        )}
        {data && (
          <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
            {count} cliente{count === 1 ? '' : 's'}
          </span>
        )}
        <Button type="button" onClick={handleCreate} size="sm" className="sm:ml-auto">
          <Plus className="h-4 w-4" />
          Adicionar Cliente
        </Button>
      </form>

      {/* Sort row: order results by attribute, toggling asc/desc. */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Ordenar por:</span>
        {SORT_OPTIONS.map(({ field, label }) => {
          const active = sort?.field === field;
          return (
            <Button
              key={field}
              type="button"
              variant={active ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 min-w-0 px-3"
              onClick={() => handleSort(field)}
              aria-pressed={active}
            >
              {label}
              {active &&
                (sort.dir === 'asc' ? (
                  <ArrowUp className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDown className="h-3.5 w-3.5" />
                ))}
            </Button>
          );
        })}
      </div>

      <Card className={isFetching ? 'w-full opacity-70 transition-opacity' : 'w-full'}>
        {!customers ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-sm text-muted-foreground">
            {submittedSearch
              ? 'Nenhum cliente corresponde à pesquisa.'
              : 'Ainda não há clientes. Crie o primeiro com «Adicionar Cliente».'}
          </div>
        ) : (
          <ul className="divide-y">
            {customers.map((customer) => (
              <li key={customer.id}>
                <div
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') navigate(`/customers/${customer.id}`);
                  }}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {customer.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {[customer.company, customer.email, customer.phone]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                  <span className="hidden text-xs tabular-nums text-muted-foreground md:inline">
                    {new Date(customer.createdAt).toLocaleDateString('pt-PT')}
                  </span>
                  <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                    {customer.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 data-[state=open]:bg-muted"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-32"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}`)}>
                        Ver
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(customer)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(customer.id)}
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Server-side pagination: 10 per page. */}
      {data && pageCount > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm tabular-nums text-muted-foreground">
            Página {page} de {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data.hasPrevious}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.hasNext}
            aria-label="Página seguinte"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <CustomerDialog customer={editingCustomer} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
