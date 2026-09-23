import * as React from 'react';
import { ChevronRight, MoreVertical, Package, Plus } from 'lucide-react';
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
import { EmptyState } from '@/components/shared/EmptyState';
import { DetailPanel } from './DetailPanel';
import { cn } from '@/lib/utils';
import { useDeleteCustomerService } from '@/hooks/use-customer-services';
import { CustomerServiceDialog } from '@/components/customer/CustomerServiceDialog';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { useDeleteTarget } from '@/hooks/use-delete-target';
import type { CustomerService } from '@/types';
import { toast } from 'sonner';

function formatServiceDate(value: string | null | undefined): string {
  if (!value) return '—';
  const [y, m, d] = value.split('-');
  return y && m && d ? `${d}/${m}/${y}` : value;
}

interface CustomerServicesTabProps {
  customerId: number;
  services: CustomerService[];
  isLoading?: boolean;
}

export function CustomerServicesTab({ customerId, services, isLoading }: CustomerServicesTabProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<CustomerService | undefined>();
  const [parentIdForNew, setParentIdForNew] = React.useState<number | undefined>();
  const deleteService = useDeleteCustomerService();

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

  const handleCreate = () => {
    setEditingService(undefined);
    setParentIdForNew(undefined);
    setDialogOpen(true);
  };

  const handleCreateSubService = (parentId: number) => {
    setEditingService(undefined);
    setParentIdForNew(parentId);
    setDialogOpen(true);
  };

  const handleEdit = (service: CustomerService) => {
    setEditingService(service);
    setParentIdForNew(undefined);
    setDialogOpen(true);
  };

  const pendingDelete = useDeleteTarget<CustomerService>();
  const pendingChildren = pendingDelete.target ? getChildren(pendingDelete.target.id).length : 0;
  const confirmDelete = async () => {
    if (!pendingDelete.target) return;
    await deleteService.mutateAsync({ id: pendingDelete.target.id, customerId });
    toast.success('Serviço eliminado');
  };

  const formatCurrency = (valor: number, moeda: string) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: moeda,
    }).format(valor);
  };

  if (isLoading) {
    return (
      <DetailPanel title="Serviços">
        <div className="flex flex-col gap-3 p-4" aria-busy>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </DetailPanel>
    );
  }

  const renderServiceRow = (service: CustomerService, isChild: boolean = false) => {
    const children = getChildren(service.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedRows.has(service.id);

    return (
      <React.Fragment key={service.id}>
        <TableRow className={cn(isChild && 'bg-background/60')}>
          <TableCell className="font-medium">
            <div className={cn('flex items-center gap-1.5', isChild && 'pl-7')}>
              {!isChild && hasChildren ? (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => toggleExpand(service.id)}
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? 'Ocultar' : 'Mostrar'} sub-serviços de ${service.acesso}`}
                >
                  <ChevronRight className={cn('transition-transform', isExpanded && 'rotate-90')} />
                </Button>
              ) : !isChild ? (
                <span className="inline-block w-6" />
              ) : null}
              <span className="type-mono">{service.acesso}</span>
              {!isChild && hasChildren && (
                <span className="type-caption text-muted-foreground tabular-nums">
                  +{children.length}
                </span>
              )}
            </div>
          </TableCell>
          <TableCell>{service.tarifario}</TableCell>
          <TableCell className="text-foreground-secondary">{service.operadora}</TableCell>
          <TableCell className="text-right type-mono">
            {formatCurrency(service.valor, service.moeda)}
          </TableCell>
          <TableCell className="type-mono text-xs text-foreground-secondary">
            {service.conta || '—'}
          </TableCell>
          <TableCell className="type-mono text-xs text-foreground-secondary">
            {service.cvp || '—'}
          </TableCell>
          <TableCell className="type-mono text-xs text-foreground-secondary">
            {service.numClient || '—'}
          </TableCell>
          <TableCell className="type-mono text-xs text-foreground-secondary">
            {service.numServico || '—'}
          </TableCell>
          <TableCell
            className="hidden max-w-[240px] truncate text-foreground-secondary 2xl:table-cell"
            title={service.morada || undefined}
          >
            {service.morada || '—'}
          </TableCell>
          <TableCell className="type-mono text-xs">{formatServiceDate(service.dataFim)}</TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs" aria-label={`Ações para ${service.acesso}`}>
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleEdit(service)}>Editar</DropdownMenuItem>
                {!isChild && (
                  <DropdownMenuItem onClick={() => handleCreateSubService(service.id)}>
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
      <DetailPanel
        title="Serviços"
        description="Serviços contratados para este cliente"
        action={
          <Button size="sm" onClick={handleCreate}>
            <Plus />
            Criar serviço
          </Button>
        }
      >
        {parentServices.length === 0 ? (
          <EmptyState
            icon={<Package />}
            title="Sem serviços"
            action={
              <Button variant="outline" size="sm" onClick={handleCreate}>
                Criar primeiro serviço
              </Button>
            }
          />
        ) : (
          <Table>
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
                <TableHead className="hidden 2xl:table-cell">Morada</TableHead>
                <TableHead>Data fim</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{parentServices.map((service) => renderServiceRow(service))}</TableBody>
          </Table>
        )}
      </DetailPanel>

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

      <CustomerServiceDialog
        customerId={customerId}
        parentId={parentIdForNew}
        service={editingService}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
