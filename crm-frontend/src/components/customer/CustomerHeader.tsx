import * as React from 'react';
import { Mail, Pencil, Phone, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InitialsAvatar } from '@/components/shared/InitialsAvatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CustomerDialog } from '@/components/customer/CustomerDialog';
import { getStatusTone } from '@/lib/status';
import { formatNif, getStatusLabel } from '@/lib/utils';
import type { Customer } from '@/types';

interface CustomerHeaderProps {
  customer: Customer;
  /** Opens the page's service dialog in create mode. */
  onNewService: () => void;
}

/**
 * Profile card at the top of the customer page (template `UserDetail` ›
 * Profile): 72px initials, the serif `<h1>` with the status pill, a
 * "empresa · NIF" line, and the contact / edit / new-service actions.
 */
export function CustomerHeader({ customer, onNewService }: CustomerHeaderProps) {
  const [editOpen, setEditOpen] = React.useState(false);
  const titleId = React.useId();

  const subline = [
    customer.company ? <span key="company">{customer.company}</span> : null,
    customer.nif ? (
      <span key="nif" className="whitespace-nowrap">
        NIF <span className="type-mono">{formatNif(customer.nif)}</span>
      </span>
    ) : null,
  ].filter(Boolean);

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-border bg-card p-6 text-card-foreground"
    >
      <div className="flex min-w-0 items-center gap-4.5">
        <InitialsAvatar name={customer.name} id={customer.id} size="xl" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h1 id={titleId} className="min-w-0 type-title break-words text-foreground">
              {customer.name}
            </h1>
            <StatusBadge tone={getStatusTone(customer.status)}>
              {getStatusLabel(customer.status)}
            </StatusBadge>
          </div>
          {subline.length > 0 && (
            <p className="type-lead text-muted-foreground">
              {subline.map((part, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span aria-hidden> · </span>}
                  {part}
                </React.Fragment>
              ))}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {customer.email && (
          <Button variant="outline" asChild>
            <a href={`mailto:${customer.email}`}>
              <Mail aria-hidden />
              Email
            </a>
          </Button>
        )}
        {customer.phone && (
          <Button variant="outline" asChild>
            <a href={`tel:${customer.phone}`}>
              <Phone aria-hidden />
              Ligar
            </a>
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setEditOpen(true)}
          aria-label="Editar cliente"
          title="Editar cliente"
        >
          <Pencil aria-hidden />
        </Button>
        <Button onClick={onNewService}>
          <Plus aria-hidden />
          Novo serviço
        </Button>
      </div>

      <CustomerDialog customer={customer} open={editOpen} onOpenChange={setEditOpen} />
    </section>
  );
}
