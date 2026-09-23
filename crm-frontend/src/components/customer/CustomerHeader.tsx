import * as React from 'react';
import { Mail, Pencil, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CustomerDialog } from '@/components/customer/CustomerDialog';
import { getStatusTone } from '@/lib/status';
import { formatNif, getStatusLabel } from '@/lib/utils';
import type { Customer } from '@/types';

interface CustomerHeaderProps {
  customer: Customer;
  children?: React.ReactNode;
}

/** Page header for a customer: name, NIF, status, company and contact actions. */
export function CustomerHeader({ customer, children }: CustomerHeaderProps) {
  const [editOpen, setEditOpen] = React.useState(false);

  return (
    <>
      <PageHeader
        title={customer.name}
        identifier={customer.nif ? `NIF ${formatNif(customer.nif)}` : undefined}
        meta={
          <StatusBadge tone={getStatusTone(customer.status)}>
            {getStatusLabel(customer.status)}
          </StatusBadge>
        }
        description={customer.company || undefined}
        actions={
          <>
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
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil aria-hidden />
              Editar
            </Button>
          </>
        }
      >
        {children}
      </PageHeader>
      <CustomerDialog customer={customer} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
