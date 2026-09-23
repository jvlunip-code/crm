import { Link, useParams } from 'react-router-dom';
import { UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/EmptyState';
import { useCustomer } from '@/hooks/use-customers';
import { useCustomerServices } from '@/hooks/use-customer-services';
import { useCustomerNotes } from '@/hooks/use-customer-notes';
import { useCustomerDocuments } from '@/hooks/use-customer-documents';
import { useCustomerAddress } from '@/hooks/use-customer-address';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { CustomerSummaryCards } from '@/components/customer/CustomerSummaryCards';
import { CustomerOverviewTab } from '@/components/customer/CustomerOverviewTab';
import { CustomerServicesTab } from '@/components/customer/CustomerServicesTab';
import { CustomerNotesTab } from '@/components/customer/CustomerNotesTab';
import { CustomerDocumentsTab } from '@/components/customer/CustomerDocumentsTab';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const customerId = Number(id);

  const { data: customer, isLoading: customerLoading } = useCustomer(customerId);
  const { data: customerServices, isLoading: servicesLoading } = useCustomerServices(customerId);
  const { data: notes, isLoading: notesLoading } = useCustomerNotes(customerId);
  const { data: documents, isLoading: documentsLoading } = useCustomerDocuments(customerId);
  const { data: address } = useCustomerAddress(customerId);

  if (customerLoading) {
    return (
      <div className="flex flex-col gap-3 px-4 py-4 lg:px-6" aria-busy>
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="px-4 py-4 lg:px-6">
        <EmptyState
          framed
          icon={<UserX />}
          title="Cliente não encontrado"
          description="O cliente pode ter sido eliminado ou o endereço está incorreto."
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/customers">Voltar aos clientes</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const parentCount = customerServices?.filter((s) => !s.parentId).length ?? 0;
  const count = (n: number) =>
    n > 0 && <span className="type-caption text-muted-foreground tabular-nums">{n}</span>;

  return (
    <>
      <CustomerHeader customer={customer}>
        <CustomerSummaryCards
          customer={customer}
          services={customerServices || []}
          notes={notes || []}
        />
      </CustomerHeader>

      <div className="w-full px-4 py-4 lg:px-6">
        <Tabs defaultValue="overview">
          <TabsList variant="line">
            <TabsTrigger value="overview">Visão geral</TabsTrigger>
            <TabsTrigger value="services">Serviços {count(parentCount)}</TabsTrigger>
            <TabsTrigger value="notes">Notas {count(notes?.length ?? 0)}</TabsTrigger>
            <TabsTrigger value="documents">Documentos {count(documents?.length ?? 0)}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <CustomerOverviewTab customer={customer} customerId={customerId} address={address} />
          </TabsContent>

          <TabsContent value="services" className="mt-4">
            <CustomerServicesTab
              customerId={customerId}
              services={customerServices || []}
              isLoading={servicesLoading}
            />
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <CustomerNotesTab
              customerId={customerId}
              notes={notes || []}
              isLoading={notesLoading}
            />
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <CustomerDocumentsTab
              customerId={customerId}
              documents={documents || []}
              isLoading={documentsLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
