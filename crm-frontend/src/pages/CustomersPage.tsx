import * as React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MoreHorizontal, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { InitialsAvatar } from '@/components/shared/InitialsAvatar';
import { ListTabs, type ListTab } from '@/components/shared/ListTabs';
import { PageContainer } from '@/components/shared/PageContainer';
import { PageHeader } from '@/components/shared/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SortableHead, type SortHeadState } from '@/components/shared/SortableHead';
import { TableCard } from '@/components/shared/TableCard';
import { TagChip, TagDot } from '@/components/shared/TagChip';
import { CustomerDialog } from '@/components/customer/CustomerDialog';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { CustomerSearchCombobox } from '@/components/customer/CustomerSearchCombobox';
import { useCustomersPage, useDeleteCustomer } from '@/hooks/use-customers';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { useDeleteTarget } from '@/hooks/use-delete-target';
import { useTags } from '@/hooks/use-tags';
import { getStatusTone } from '@/lib/status';
import { cn, formatCount, formatNif, getStatusLabel } from '@/lib/utils';
import type { Customer } from '@/types';

const PAGE_SIZE = 10;
/** Tag chips shown per row before collapsing the rest into "+N". */
const MAX_ROW_TAGS = 2;

const DATE = new Intl.DateTimeFormat('pt-PT');

type SortField = 'name' | 'company' | 'status' | 'created_at';
type SortState = SortHeadState<SortField>;

/** `?estado=` tab (pt-PT in the URL, so the dashboard can deep-link it). */
type Estado = 'todos' | 'ativos' | 'inativos';
const ESTADO_STATUS: Record<Estado, Customer['status'] | undefined> = {
  todos: undefined,
  ativos: 'active',
  inativos: 'inactive',
};

function parseEstado(value: string | null): Estado {
  return value === 'ativos' || value === 'inativos' ? value : 'todos';
}

const plural = (n: number, one: string, many: string) =>
  `${formatCount(n)} ${n === 1 ? one : many}`;

export function CustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const estado = parseEstado(searchParams.get('estado'));
  const status = ESTADO_STATUS[estado];

  const [searchInput, setSearchInput] = React.useState('');
  const [submittedSearch, setSubmittedSearch] = React.useState('');
  const [sort, setSort] = React.useState<SortState>(null);
  // The page belongs to the tab it was chosen on: a new `?estado=` (tab click,
  // back button, a link to /customers) starts again at page 1.
  const [pageState, setPageState] = React.useState({ estado, page: 1 });
  const page = pageState.estado === estado ? pageState.page : 1;
  const setPage = (next: number) => setPageState({ estado, page: next });
  const [tagFilter, setTagFilter] = React.useState<number | undefined>();
  const { data: tags = [] } = useTags();
  const { data: summary } = useDashboardSummary();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | undefined>();

  const ordering = sort ? `${sort.dir === 'desc' ? '-' : ''}${sort.field}` : undefined;
  const { data, isFetching, isError, error, refetch } = useCustomersPage({
    search: submittedSearch,
    tag: tagFilter,
    status,
    ordering,
    page,
  });
  const deleteCustomer = useDeleteCustomer();

  const customers = data?.items;
  const count = data?.count ?? 0;
  const filtered = Boolean(submittedSearch || tagFilter);

  const handleEstadoChange = (next: Estado) => {
    setSearchParams(
      (params) => {
        const updated = new URLSearchParams(params);
        if (next === 'todos') updated.delete('estado');
        else updated.set('estado', next);
        return updated;
      },
      { replace: true },
    );
    setPageState({ estado: next, page: 1 });
  };

  const handleSubmitSearch = () => {
    setSubmittedSearch(searchInput.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSubmittedSearch('');
    setPage(1);
  };

  const handleClearFilters = () => {
    handleClearSearch();
    setTagFilter(undefined);
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

  // Global counts (the summary), like the tabs: they ignore search and tag.
  const totals = summary?.customers;
  const tabs: ListTab<Estado>[] = [
    { value: 'todos', label: 'Todos', count: totals?.total },
    { value: 'ativos', label: 'Ativos', count: totals?.active },
    { value: 'inativos', label: 'Inativos', count: totals?.inactive },
  ];

  const emptyTitle = filtered
    ? 'Nenhum cliente corresponde à pesquisa.'
    : estado === 'ativos'
      ? 'Não há clientes ativos.'
      : estado === 'inativos'
        ? 'Não há clientes inativos.'
        : 'Ainda não há clientes.';

  return (
    <PageContainer>
      <PageHeader
        title="Clientes"
        description={
          totals
            ? `${plural(totals.total, 'cliente', 'clientes')} · ${plural(totals.active, 'ativo', 'ativos')}`
            : undefined
        }
        actions={
          <Button onClick={handleCreate}>
            <Plus aria-hidden />
            Novo cliente
          </Button>
        }
      />

      <ListTabs
        value={estado}
        onValueChange={handleEstadoChange}
        tabs={tabs}
        aria-label="Filtrar por estado"
        className="gap-6"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            {/* Server-side full-text search: runs on submit, not per keystroke. */}
            <form
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmitSearch();
              }}
              className="flex min-w-0 grow basis-72 items-center gap-2 sm:max-w-140"
            >
              <CustomerSearchCombobox
                value={searchInput}
                onChange={setSearchInput}
                onClear={handleClearSearch}
                className="min-w-0 flex-1"
              />
              <Button type="submit" variant="outline" size="lg">
                Pesquisar
              </Button>
            </form>
            {tags.length > 0 && (
              <Select
                value={tagFilter ? String(tagFilter) : 'all'}
                onValueChange={(value) => {
                  setTagFilter(value === 'all' ? undefined : Number(value));
                  setPage(1);
                }}
              >
                {/* Filter button: "Etiqueta" label, then the current value. */}
                <SelectTrigger size="lg" className="max-w-full justify-start">
                  <span className="font-normal text-muted-foreground">Etiqueta</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={String(tag.id)}>
                      <TagDot color={tag.color} />
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <TableCard
            aria-label="Clientes"
            aria-busy={isFetching}
            ivoryHead
            className={cn('transition-opacity', isFetching && customers && 'opacity-70')}
            footer={
              customers && count > 0 ? (
                // Server-side pagination: 10 per page.
                <Pagination
                  offset={(page - 1) * PAGE_SIZE}
                  pageSize={PAGE_SIZE}
                  total={count}
                  onChange={(offset) => setPage(offset / PAGE_SIZE + 1)}
                />
              ) : undefined
            }
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
              <div className="flex flex-col gap-4 p-6" aria-busy>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            ) : customers.length === 0 ? (
              <EmptyState
                icon={<Users />}
                title={emptyTitle}
                description={
                  !filtered && estado === 'todos'
                    ? 'Crie o primeiro com «Novo cliente».'
                    : undefined
                }
                action={
                  filtered ? (
                    <Button variant="outline" size="sm" onClick={handleClearFilters}>
                      Limpar pesquisa e filtros
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <Table inset className="min-w-160">
                <TableHeader>
                  <TableRow>
                    <SortableHead field="name" sort={sort} onSort={handleSort}>
                      Nome
                    </SortableHead>
                    <SortableHead field="company" sort={sort} onSort={handleSort}>
                      Empresa
                    </SortableHead>
                    <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                    <TableHead className="hidden xl:table-cell">Etiquetas</TableHead>
                    <SortableHead field="status" sort={sort} onSort={handleSort}>
                      Estado
                    </SortableHead>
                    <SortableHead
                      field="created_at"
                      sort={sort}
                      onSort={handleSort}
                      className="hidden text-right md:table-cell"
                    >
                      Criado em
                    </SortableHead>
                    <TableHead className="w-14">
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <CustomerRow
                      key={customer.id}
                      customer={customer}
                      onEdit={() => handleEdit(customer)}
                      onDelete={() => pendingDelete.request(customer)}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </TableCard>
        </div>
      </ListTabs>

      <CustomerDialog customer={editingCustomer} open={dialogOpen} onOpenChange={setDialogOpen} />
      <ConfirmDeleteDialog
        open={pendingDelete.open}
        onOpenChange={pendingDelete.setOpen}
        title={`Eliminar ${pendingDelete.target?.name ?? 'cliente'}?`}
        description="O cliente e todos os seus serviços, documentos, contactos e morada serão eliminados permanentemente. Esta ação não pode ser anulada."
        confirmLabel="Eliminar cliente"
        onConfirm={confirmDelete}
      />
    </PageContainer>
  );
}

function CustomerRow({
  customer,
  onEdit,
  onDelete,
}: {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const contact = customer.email || customer.phone;
  const shownTags = customer.tags.slice(0, MAX_ROW_TAGS);
  const hiddenTags = customer.tags.slice(MAX_ROW_TAGS);

  return (
    <TableRow>
      <TableCell className="max-w-80">
        <div className="flex min-w-0 items-center gap-3">
          <InitialsAvatar name={customer.name} id={customer.id} size="md" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Link
              to={`/customers/${customer.id}`}
              className="truncate rounded-xs font-medium text-foreground underline-offset-2 hover:underline"
            >
              {customer.name}
            </Link>
            {contact && (
              <span className="truncate type-dense text-muted-foreground">{contact}</span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="max-w-64">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate">
            {customer.company || <span className="text-muted-foreground">—</span>}
          </span>
          {customer.nif && (
            <span className="type-mono text-muted-foreground">
              <span className="sr-only">NIF </span>
              {formatNif(customer.nif)}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden whitespace-nowrap text-foreground-secondary lg:table-cell">
        {customer.phone || <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        {customer.tags.length > 0 ? (
          <div className="flex items-center gap-1.5">
            {shownTags.map((tag) => (
              <TagChip key={tag.id} tag={tag} className="max-w-32" />
            ))}
            {hiddenTags.length > 0 && (
              <span
                className="shrink-0 type-dense text-muted-foreground"
                title={hiddenTags.map((tag) => tag.name).join(', ')}
              >
                <span aria-hidden>+{hiddenTags.length}</span>
                <span className="sr-only">
                  e mais {hiddenTags.length}: {hiddenTags.map((tag) => tag.name).join(', ')}
                </span>
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <StatusBadge tone={getStatusTone(customer.status)}>
          {getStatusLabel(customer.status)}
        </StatusBadge>
      </TableCell>
      <TableCell className="hidden text-right whitespace-nowrap text-muted-foreground md:table-cell">
        {DATE.format(new Date(customer.createdAt))}
      </TableCell>
      <TableCell className="py-1.5 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Ações para ${customer.name}`}>
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
