import { StatStrip } from '@/components/shared/StatStrip';
import { formatCurrency } from '@/lib/utils';
import type { Customer, CustomerService, CustomerNote } from '@/types';

interface CustomerSummaryCardsProps {
  customer: Customer;
  services: CustomerService[];
  notes: CustomerNote[];
}

/** Card-less health board for the customer header. */
export function CustomerSummaryCards({ customer, services, notes }: CustomerSummaryCardsProps) {
  const parentServices = services.filter((s) => !s.parentId);
  const totalValor = services.reduce((total, s) => total + s.valor, 0);
  const memberSince = new Date(customer.createdAt).toLocaleDateString('pt-PT', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <StatStrip
      aria-label="Resumo do cliente"
      className="mt-4"
      items={[
        {
          key: 'spend',
          label: 'Gasto mensal',
          value: formatCurrency(totalValor),
          hint: `${services.length} linha${services.length === 1 ? '' : 's'} de serviço`,
        },
        { key: 'services', label: 'Serviços ativos', value: parentServices.length },
        { key: 'notes', label: 'Notas', value: notes.length },
        { key: 'since', label: 'Cliente desde', value: memberSince },
      ]}
    />
  );
}
