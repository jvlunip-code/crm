import * as React from 'react';
import { Check, MapPin, Pencil, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Switch } from '@/components/ui/switch';
import { CopyButton } from '@/components/shared/CopyButton';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionCard } from '@/components/shared/SectionCard';
import { TagChip } from '@/components/shared/TagChip';
import { CustomerAddressDialog } from '@/components/customer/CustomerAddressDialog';
import { CustomerTagsPicker } from '@/components/customer/CustomerTagsPicker';
import { DetailItem, DetailList } from '@/components/customer/DetailList';
import { useUpdateCustomer } from '@/hooks/use-customers';
import { cn, formatNif, getStatusLabel } from '@/lib/utils';
import type { Customer, CustomerAddress } from '@/types';

type EditableField =
  'email' | 'phone' | 'secondaryPhone' | 'company' | 'nif' | 'iban' | 'decisor' | 'segment';

const PHONE_FIELDS: EditableField[] = ['phone', 'secondaryPhone'];
const CODE_FIELDS: EditableField[] = ['nif', 'iban'];

/**
 * Side cards are ~300px wide: let the title shrink to its content so a short
 * head action ("Editar") stays on the title row instead of wrapping below.
 */
const SIDE_HEAD = '[&_[data-slot=section-card-header]>div:first-child]:basis-auto';

/** One-line postal address: "Rua X 12, 4700-123 Freguesia, Concelho". */
function formatFullAddress(address: CustomerAddress): string {
  const locality = [address.postalCode, address.parish].filter(Boolean).join(' ');
  return [address.street, locality, address.municipality].filter(Boolean).join(', ');
}

/** Up to two initials for the company tile ("Northwind Foods" → "NF"). */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (words[0][0] + last).toLocaleUpperCase('pt-PT');
}

const empty = <span className="text-muted-foreground">—</span>;

/**
 * The customer detail side column (template `UserDetail` › aside): Contacto,
 * Morada, Empresa and Etiquetas cards. Fields keep inline editing (hover or
 * focus shows the pencil; always visible on touch) and copy buttons.
 */
export function CustomerSideCards({
  customer,
  address,
}: {
  customer: Customer;
  address?: CustomerAddress | null;
}) {
  const [addressDialogOpen, setAddressDialogOpen] = React.useState(false);
  const [editingField, setEditingField] = React.useState<EditableField | null>(null);
  const [editValue, setEditValue] = React.useState('');
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
        // Phone columns are non-null text: an empty alternative phone is ''.
        updates: {
          [editingField]: PHONE_FIELDS.includes(editingField) ? editValue : editValue || null,
        },
      });
      toast.success('Dados atualizados com sucesso');
      setEditingField(null);
      setEditValue('');
    } catch {
      toast.error('Erro ao atualizar dados');
    }
  };

  const setStatus = async (checked: boolean) => {
    try {
      await updateCustomer.mutateAsync({
        id: customer.id,
        updates: { status: checked ? 'active' : 'inactive' },
      });
      toast.success(checked ? 'Cliente ativado' : 'Cliente desativado');
    } catch {
      toast.error('Erro ao atualizar estado');
    }
  };

  const renderEditable = (
    field: EditableField,
    label: string,
    display: React.ReactNode,
    options: { copyValue?: string | null; className?: string; srOnlyLabel?: boolean } = {},
  ) => {
    const isEditing = editingField === field;
    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') void saveEdit();
      if (e.key === 'Escape') cancelEditing();
    };

    return (
      <DetailItem
        key={field}
        label={label}
        srOnlyLabel={options.srOnlyLabel && !isEditing}
        // An edit row needs the full card width, even in a two-column grid.
        className={cn('group/field', options.className, isEditing && 'col-span-2')}
      >
        {isEditing ? (
          <div className="flex flex-wrap items-center gap-1">
            {PHONE_FIELDS.includes(field) ? (
              <PhoneInput
                size="sm"
                value={editValue}
                onChange={setEditValue}
                className="min-w-0 flex-1 basis-56"
                aria-label={label}
                autoFocus
                onKeyDown={onKeyDown}
              />
            ) : (
              <Input
                size="sm"
                value={editValue}
                onChange={(e) =>
                  setEditValue(
                    field === 'nif'
                      ? e.target.value.replace(/\D/g, '').slice(0, 9)
                      : e.target.value,
                  )
                }
                className={cn(
                  'min-w-0 flex-1 basis-40',
                  CODE_FIELDS.includes(field) && 'font-mono tabular-nums',
                )}
                maxLength={field === 'nif' ? 9 : undefined}
                inputMode={field === 'nif' ? 'numeric' : undefined}
                type={field === 'email' ? 'email' : 'text'}
                placeholder={field === 'nif' ? '123456789' : undefined}
                aria-label={label}
                autoComplete="off"
                autoFocus
                onKeyDown={onKeyDown}
              />
            )}
            <div className="flex shrink-0 items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => void saveEdit()}
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
          </div>
        ) : (
          <div className="flex min-h-7 items-center gap-1">
            <div className="flex min-w-0 flex-1 items-center gap-1">
              <div className="min-w-0 break-words">{display}</div>
              {options.copyValue && <CopyButton value={options.copyValue} label={label} />}
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              className="shrink-0 text-muted-foreground opacity-0 group-hover/field:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
              onClick={() => startEditing(field)}
              aria-label={`Editar ${label}`}
            >
              <Pencil />
            </Button>
          </div>
        )}
      </DetailItem>
    );
  };

  const phoneLink = (phone: string | undefined) =>
    phone ? (
      <a href={`tel:${phone}`} className="tabular-nums hover:underline">
        {phone}
      </a>
    ) : (
      empty
    );

  return (
    <>
      <SectionCard size="side" title="Contacto">
        <DetailList>
          {renderEditable(
            'email',
            'Email',
            customer.email ? (
              <a
                href={`mailto:${customer.email}`}
                className="text-link transition-colors hover:text-link-hover"
              >
                {customer.email}
              </a>
            ) : (
              empty
            ),
            { copyValue: customer.email },
          )}
          {renderEditable('phone', 'Telefone', phoneLink(customer.phone), {
            copyValue: customer.phone,
          })}
          {renderEditable(
            'secondaryPhone',
            'Telefone alternativo',
            phoneLink(customer.secondaryPhone),
            { copyValue: customer.secondaryPhone },
          )}
        </DetailList>
      </SectionCard>

      <SectionCard
        size="side"
        title="Morada"
        className={SIDE_HEAD}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAddressDialogOpen(true)}
            aria-label={address ? 'Editar morada' : 'Adicionar morada'}
          >
            {address ? <Pencil aria-hidden /> : <Plus aria-hidden />}
            {address ? 'Editar' : 'Adicionar'}
          </Button>
        }
      >
        {address ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-1">
              <p className="min-w-0 flex-1 type-body break-words text-foreground">
                {formatFullAddress(address)}
              </p>
              <CopyButton value={formatFullAddress(address)} label="Morada" />
            </div>
            <DetailList columns={2}>
              <DetailItem label="Código postal">
                {address.postalCode ? (
                  <span className="tabular-nums">{address.postalCode}</span>
                ) : (
                  empty
                )}
              </DetailItem>
              <DetailItem label="Freguesia ou localidade">{address.parish || empty}</DetailItem>
              <DetailItem label="Concelho">{address.municipality || empty}</DetailItem>
              <DetailItem label="Distrito">{address.district || empty}</DetailItem>
            </DetailList>
          </div>
        ) : (
          <EmptyState size="sm" icon={<MapPin />} title="Sem morada registada" className="py-4" />
        )}
      </SectionCard>

      <SectionCard size="side" title="Empresa">
        <DetailList columns={2}>
          {renderEditable(
            'company',
            'Empresa',
            customer.company ? (
              <span className="flex min-w-0 items-center gap-3">
                <Avatar size="tile" fill={4} aria-hidden>
                  <AvatarFallback>{initialsOf(customer.company)}</AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-medium break-words">{customer.company}</span>
                  {customer.segment && (
                    <span className="type-dense text-muted-foreground">{customer.segment}</span>
                  )}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">Sem empresa</span>
            ),
            { className: 'col-span-2', srOnlyLabel: true },
          )}
          {renderEditable(
            'nif',
            'NIF',
            customer.nif ? <span className="type-mono">{formatNif(customer.nif)}</span> : empty,
            { copyValue: customer.nif },
          )}
          {renderEditable('decisor', 'Decisor', customer.decisor || empty)}
          {renderEditable('segment', 'Segmento', customer.segment || empty)}
          <DetailItem label="Estado">
            <label className="flex min-h-7 w-fit cursor-pointer items-center gap-2">
              <Switch
                checked={customer.status === 'active'}
                onCheckedChange={(checked: boolean) => void setStatus(checked)}
                disabled={updateCustomer.isPending}
              />
              {getStatusLabel(customer.status)}
            </label>
          </DetailItem>
          {renderEditable(
            'iban',
            'IBAN',
            customer.iban ? <span className="type-mono break-all">{customer.iban}</span> : empty,
            { copyValue: customer.iban, className: 'col-span-2' },
          )}
        </DetailList>
      </SectionCard>

      <SectionCard size="side" title="Etiquetas">
        <div className="flex flex-wrap items-center gap-2">
          {customer.tags.map((tag) => (
            <TagChip key={tag.id} tag={tag} />
          ))}
          <CustomerTagsPicker customer={customer} />
        </div>
      </SectionCard>

      <CustomerAddressDialog
        customerId={customer.id}
        address={address}
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
      />
    </>
  );
}
