import { useState } from 'react';
import { Check, MapPin, Pencil, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Switch } from '@/components/ui/switch';
import { EmptyState } from '@/components/shared/EmptyState';
import { CustomerAddressDialog } from './CustomerAddressDialog';
import { DetailPanel, DetailRow } from './DetailPanel';
import { useUpdateCustomer } from '@/hooks/use-customers';
import type { Customer, CustomerAddress } from '@/types';
import { formatNif, getStatusLabel } from '@/lib/utils';
import { toast } from 'sonner';

type EditableField = 'email' | 'phone' | 'company' | 'nif' | 'iban' | 'decisor' | 'segment';

interface CustomerOverviewTabProps {
  customer: Customer;
  customerId: number;
  address?: CustomerAddress | null;
}

export function CustomerOverviewTab({ customer, customerId, address }: CustomerOverviewTabProps) {
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [editValue, setEditValue] = useState('');
  const updateCustomer = useUpdateCustomer();

  const startEditing = (field: EditableField) => {
    setEditingField(field);
    setEditValue(customer[field] ?? '');
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editingField) return;
    try {
      await updateCustomer.mutateAsync({
        id: customer.id,
        updates: { [editingField]: editValue || null },
      });
      toast.success('Dados atualizados com sucesso');
      setEditingField(null);
      setEditValue('');
    } catch {
      toast.error('Erro ao atualizar dados');
    }
  };

  const renderEditableField = (
    field: EditableField,
    label: string,
    displayValue: React.ReactNode,
  ) => {
    const isEditing = editingField === field;
    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') saveEdit();
      if (e.key === 'Escape') cancelEditing();
    };

    return (
      <div className="group/field px-4 py-2.5">
        <dt className="type-eyebrow text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 type-dense text-foreground">
          {isEditing ? (
            <div className="flex items-center gap-1">
              {field === 'phone' ? (
                <PhoneInput value={editValue} onChange={setEditValue} className="flex-1" />
              ) : (
                <Input
                  value={editValue}
                  onChange={(e) =>
                    setEditValue(
                      field === 'nif'
                        ? e.target.value.replace(/\D/g, '').slice(0, 9)
                        : e.target.value,
                    )
                  }
                  className={field === 'nif' || field === 'iban' ? 'h-7 type-mono' : 'h-7'}
                  maxLength={field === 'nif' ? 9 : undefined}
                  placeholder={field === 'nif' ? '123456789' : undefined}
                  aria-label={label}
                  autoFocus
                  onKeyDown={onKeyDown}
                />
              )}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={saveEdit}
                disabled={updateCustomer.isPending}
                aria-label="Guardar"
              >
                <Check />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={cancelEditing}
                disabled={updateCustomer.isPending}
                aria-label="Cancelar"
              >
                <X />
              </Button>
            </div>
          ) : (
            <div className="flex min-h-6 items-center gap-1">
              <div className="min-w-0 flex-1 break-words">{displayValue}</div>
              <Button
                variant="ghost"
                size="icon-xs"
                className="opacity-0 group-hover/field:opacity-100 focus-visible:opacity-100"
                onClick={() => startEditing(field)}
                aria-label={`Editar ${label}`}
              >
                <Pencil />
              </Button>
            </div>
          )}
        </dd>
      </div>
    );
  };

  const empty = <span className="text-muted-foreground">—</span>;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DetailPanel title="Identificação">
        <dl className="divide-y divide-border-subtle">
          {renderEditableField(
            'nif',
            'NIF',
            customer.nif ? <span className="type-mono">{formatNif(customer.nif)}</span> : empty,
          )}
          {renderEditableField(
            'iban',
            'IBAN',
            customer.iban ? <span className="type-mono">{customer.iban}</span> : empty,
          )}
          {renderEditableField('company', 'Empresa', customer.company || empty)}
          {renderEditableField('segment', 'Segmento', customer.segment ?? empty)}
          {renderEditableField('decisor', 'Decisor', customer.decisor ?? empty)}
        </dl>
      </DetailPanel>

      <div className="flex flex-col gap-4">
        <DetailPanel title="Contacto">
          <dl className="divide-y divide-border-subtle">
            {renderEditableField(
              'email',
              'Email',
              customer.email ? (
                <a href={`mailto:${customer.email}`} className="hover:underline">
                  {customer.email}
                </a>
              ) : (
                empty
              ),
            )}
            {renderEditableField(
              'phone',
              'Telefone',
              customer.phone ? (
                <a href={`tel:${customer.phone}`} className="type-mono hover:underline">
                  {customer.phone}
                </a>
              ) : (
                empty
              ),
            )}
          </dl>
        </DetailPanel>

        <DetailPanel title="Conta">
          <dl className="divide-y divide-border-subtle">
            <DetailRow label="Cliente desde">
              {new Date(customer.createdAt).toLocaleDateString('pt-PT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </DetailRow>
            <DetailRow label="Estado">
              <label className="flex w-fit items-center gap-2">
                <Switch
                  checked={customer.status === 'active'}
                  onCheckedChange={async (checked: boolean) => {
                    try {
                      await updateCustomer.mutateAsync({
                        id: customer.id,
                        updates: { status: checked ? 'active' : 'inactive' },
                      });
                      toast.success(checked ? 'Cliente ativado' : 'Cliente desativado');
                    } catch {
                      toast.error('Erro ao atualizar estado');
                    }
                  }}
                  disabled={updateCustomer.isPending}
                />
                {getStatusLabel(customer.status)}
              </label>
            </DetailRow>
          </dl>
        </DetailPanel>
      </div>

      <DetailPanel
        title="Morada"
        className="lg:col-span-2"
        action={
          <Button variant="outline" size="sm" onClick={() => setAddressDialogOpen(true)}>
            {address ? <Pencil /> : <Plus />}
            {address ? 'Editar' : 'Adicionar'}
          </Button>
        }
      >
        {address ? (
          <dl className="grid sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow label="Morada" className="sm:col-span-2 lg:col-span-3">
              {address.street}
            </DetailRow>
            <DetailRow label="Código postal">
              <span className="type-mono">{address.postalCode}</span>
            </DetailRow>
            <DetailRow label="Freguesia ou localidade">{address.parish || empty}</DetailRow>
            <DetailRow label="Concelho">{address.municipality || empty}</DetailRow>
            <DetailRow label="Distrito">{address.district || empty}</DetailRow>
          </dl>
        ) : (
          <EmptyState size="sm" icon={<MapPin />} title="Sem morada registada" />
        )}
      </DetailPanel>

      <CustomerAddressDialog
        customerId={customerId}
        address={address}
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
      />
    </div>
  );
}
