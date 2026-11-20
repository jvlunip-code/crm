import * as React from 'react';
import { ChevronRight, MoreHorizontal, Package, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { ServiceDialogTarget } from '@/components/customer/CustomerServiceDialog';
import { useDeleteCustomerService } from '@/hooks/use-customer-services';
import { useDeleteTarget } from '@/hooks/use-delete-target';
import { serviceEndUrgency, todayInLisbon } from '@/lib/status';
import { cn, formatServiceDate } from '@/lib/utils';
import type { CustomerService } from '@/types';

interface CustomerServicesTabProps {
  customerId: number;
  services: CustomerService[];
  isLoading?: boolean;
  /** Opens the page's service dialog (create, sub-service, edit or duplicate). */
  onOpenServiceDialog: (target: ServiceDialogTarget) => void;
}

const formatMoney = (valor: number, moeda: string) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: moeda }).format(valor);

/**
 * Services table inside the detail page's records card. Keeps every column
 * (PLAN decision 14) and scrolls sideways inside the card; parents expand to
 * show their sub-services.
 */
export function CustomerServicesTab({
  customerId,
  services,
  isLoading,
  onOpenServiceDialog,
}: CustomerServicesTabProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set());
  const deleteService = useDeleteCustomerService();
  const today = todayInLisbon();

  const parentServices = services.filter((s) => !s.parentId);
  const getChildren = (parentId: number) => services.filter((s) => s.parentId === parentId);

  const toggleExpand = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const pendingDelete = useDeleteTarget<CustomerService>();
  const pendingChildren = pendingDelete.target ? getChildren(pendingDelete.target.id).length : 0;
  const confirmDelete = async () => {
    if (!pendingDelete.target) return;
    await deleteService.mutateAsync({ id: pendingDelete.target.id, customerId });
    toast.success('Serviço eliminado');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-6 py-5" aria-busy>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  if (parentServices.length === 0) {
    return (
      <EmptyState
        icon={<Package />}
        title="Sem serviços"
        description="Registe o primeiro serviço contratado por este cliente."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenServiceDialog({ mode: 'create' })}
          >
            <Plus aria-hidden />
            Criar primeiro serviço
          </Button>
        }
      />
    );
  }

  const muted = (value: string) =>
    value ? value : <span className="text-foreground-tertiary">—</span>;

  const renderServiceRow = (service: CustomerService, isChild = false) => {
    const children = getChildren(service.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedRows.has(service.id);
    const urgency = serviceEndUrgency(service.dataFim, today);

    return (
      <React.Fragment key={service.id}>
        <TableRow className={cn(isChild && 'bg-background/60')}>
          <TableCell className="font-medium">
            <div className={cn('flex items-center gap-1.5', isChild && 'pl-8')}>
              {!isChild && hasChildren ? (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="-ml-1"
                  onClick={() => toggleExpand(service.id)}
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? 'Ocultar' : 'Mostrar'} sub-serviços de ${service.acesso}`}
                >
                  <ChevronRight className={cn('transition-transform', isExpanded && 'rotate-90')} />
                </Button>
              ) : !isChild ? (
                <span aria-hidden className="-ml-1 inline-block w-7" />
              ) : null}
              <span className="type-mono">{service.acesso}</span>
              {!isChild && hasChildren && (
                <span className="type-caption text-muted-foreground tabular-nums">
                  <span className="sr-only">, </span>+{children.length}
                  <span className="sr-only"> sub-serviços</span>
                </span>
              )}
            </div>
          </TableCell>
          <TableCell>{muted(service.tarifario)}</TableCell>
          <TableCell>
            {service.operadora ? <Badge tone="chip">{service.operadora}</Badge> : muted('')}
          </TableCell>
          <TableCell className="text-right whitespace-nowrap">
            {formatMoney(service.valor, service.moeda)}
            <span className="text-muted-foreground">/mês</span>
          </TableCell>
          <TableCell className="text-foreground-secondary">{muted(service.conta)}</TableCell>
          <TableCell className="text-foreground-secondary">{muted(service.cvp)}</TableCell>
          <TableCell className="text-foreground-secondary">{muted(service.numClient)}</TableCell>
          <TableCell className="text-foreground-secondary">
            {service.numServico ? (
              <span className="type-mono">{service.numServico}</span>
            ) : (
              muted('')
            )}
          </TableCell>
          <TableCell
            className="max-w-60 truncate text-foreground-secondary"
            title={service.morada || undefined}
          >
            {muted(service.morada)}
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <span className={cn(!service.dataFim && 'text-foreground-tertiary')}>
                {formatServiceDate(service.dataFim)}
              </span>
              {urgency?.urgent && <StatusBadge tone={urgency.tone}>{urgency.label}</StatusBadge>}
            </div>
          </TableCell>
          <TableCell className="w-12 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Ações para ${service.acesso}`}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => onOpenServiceDialog({ mode: 'edit', service })}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onOpenServiceDialog({ mode: 'duplicate', service })}
                >
                  Duplicar
                </DropdownMenuItem>
                {!isChild && (
                  <DropdownMenuItem
                    onClick={() => onOpenServiceDialog({ mode: 'create', parentId: service.id })}
                  >
                    Adicionar sub-serviço
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => pendingDelete.request(service)}
                >
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {!isChild && isExpanded && children.map((child) => renderServiceRow(child, true))}
      </React.Fragment>
    );
  };

  return (
    <>
      <div className="pb-2">
        <Table inset>
          <TableHeader>
            <TableRow>
              <TableHead>Acesso (ID)</TableHead>
              <TableHead>Tarifário</TableHead>
              <TableHead>Operadora</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>CVP</TableHead>
              <TableHead>Nº cliente</TableHead>
              <TableHead>Nº serviço</TableHead>
              <TableHead>Morada</TableHead>
              <TableHead>Data fim</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{parentServices.map((service) => renderServiceRow(service))}</TableBody>
        </Table>
      </div>

      <ConfirmDeleteDialog
        open={pendingDelete.open}
        onOpenChange={pendingDelete.setOpen}
        title={`Eliminar o serviço ${pendingDelete.target?.acesso ?? ''}?`}
        description={
          pendingChildren > 0
            ? `O serviço e os seus ${pendingChildren} sub-serviço${pendingChildren === 1 ? '' : 's'} serão eliminados permanentemente.`
            : 'O serviço será eliminado permanentemente.'
        }
        confirmLabel="Eliminar serviço"
        onConfirm={confirmDelete}
      />
    </>
  );
}
