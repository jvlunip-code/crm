import * as React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ListTabs, type ListTab } from '@/components/shared/ListTabs';
import { PageBreadcrumb } from '@/components/shared/PageBreadcrumb';
import { PageContainer } from '@/components/shared/PageContainer';
import { useCustomer } from '@/hooks/use-customers';
import { useCustomerServices } from '@/hooks/use-customer-services';
import { useCustomerNotes } from '@/hooks/use-customer-notes';
import { useCustomerDocuments } from '@/hooks/use-customer-documents';
import { useCustomerAddress } from '@/hooks/use-customer-address';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { CustomerSummaryCards } from '@/components/customer/CustomerSummaryCards';
import { CustomerSideCards } from '@/components/customer/CustomerSideCards';
import { CustomerServicesTab } from '@/components/customer/CustomerServicesTab';
import { CustomerNotesTab } from '@/components/customer/CustomerNotesTab';
import { CustomerDocumentsTab } from '@/components/customer/CustomerDocumentsTab';
import {
  CustomerServiceDialog,
  type ServiceDialogTarget,
} from '@/components/customer/CustomerServiceDialog';

type RecordTab = 'servicos' | 'documentos' | 'notas';
const RECORD_TABS: RecordTab[] = ['servicos', 'documentos', 'notas'];

const CRUMB_ROOT = { label: 'Clientes', to: '/customers' };

/**
 * Customer page (template `UserDetail`): breadcrumb, profile card, KPI row,
 * then a records card (Serviços / Documentos / Notas, `?tab=`) beside the
 * Contacto / Morada / Empresa / Etiquetas side cards. The two columns wrap
 * below 836px of content width, side cards first (the most frequent lookup).
 */
export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const customerId = Number(id);
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: customer, isLoading: customerLoading } = useCustomer(customerId);
  const { data: customerServices, isLoading: servicesLoading } = useCustomerServices(customerId);
  const { data: notes, isLoading: notesLoading } = useCustomerNotes(customerId);
  const { data: documents, isLoading: documentsLoading } = useCustomerDocuments(customerId);
  const { data: address } = useCustomerAddress(customerId);

  // One service dialog for the whole page: "Novo serviço" in the profile card
  // and edit / duplicate / sub-service from the services table.
  const [serviceDialogOpen, setServiceDialogOpen] = React.useState(false);
  const [serviceTarget, setServiceTarget] = React.useState<ServiceDialogTarget>({
    mode: 'create',
  });
  const openServiceDialog = React.useCallback((target: ServiceDialogTarget) => {
    setServiceTarget(target);
    setServiceDialogOpen(true);
  }, []);

  const tabParam = searchParams.get('tab') as RecordTab | null;
  const tab: RecordTab = tabParam && RECORD_TABS.includes(tabParam) ? tabParam : 'servicos';
  const setTab = (next: RecordTab) =>
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (next === 'servicos') params.delete('tab');
        else params.set('tab', next);
        return params;
      },
      { replace: true },
    );

  if (customerLoading) {
    return (
      <PageContainer aria-busy>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-30 w-full rounded-xl" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,12.5rem),1fr))] gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-25 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </PageContainer>
    );
  }

  if (!customer) {
    return (
      <PageContainer>
        <PageBreadcrumb crumbs={[CRUMB_ROOT, { label: 'Cliente não encontrado' }]} />
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
      </PageContainer>
    );
  }

  const services = customerServices ?? [];
  const parentCount = services.filter((s) => !s.parentId).length;

  const tabs: ListTab<RecordTab>[] = [
    { value: 'servicos', label: 'Serviços', count: servicesLoading ? null : parentCount },
    {
      value: 'documentos',
      label: 'Documentos',
      count: documentsLoading ? null : (documents?.length ?? 0),
    },
    { value: 'notas', label: 'Notas', count: notesLoading ? null : (notes?.length ?? 0) },
  ];

  return (
    <PageContainer>
      <PageBreadcrumb crumbs={[CRUMB_ROOT, { label: customer.name }]} />

      <CustomerHeader
        customer={customer}
        onNewService={() => openServiceDialog({ mode: 'create' })}
      />

      <CustomerSummaryCards
        services={services}
        documentsCount={documents?.length ?? 0}
        servicesLoading={servicesLoading}
        documentsLoading={documentsLoading}
      />

      <div className="@container">
        {/* Side cards come first in the DOM so the narrow, stacked view (side
            cards above the records) keeps reading and focus order in step;
            from 836px the grid places them in the right-hand column. */}
        <div className="flex flex-col gap-4 @min-[836px]:grid @min-[836px]:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] @min-[836px]:items-start">
          <div className="flex min-w-0 flex-col gap-4 @min-[836px]:col-start-2 @min-[836px]:row-start-1">
            <CustomerSideCards customer={customer} address={address} />
          </div>

          <section
            aria-label="Registos do cliente"
            className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground @min-[836px]:col-start-1 @min-[836px]:row-start-1"
          >
            <ListTabs
              value={tab}
              onValueChange={setTab}
              tabs={tabs}
              size="card"
              aria-label="Registos do cliente"
              className="gap-0"
              listClassName="px-4"
            >
              {tab === 'servicos' && (
                <CustomerServicesTab
                  customerId={customerId}
                  services={services}
                  isLoading={servicesLoading}
                  onOpenServiceDialog={openServiceDialog}
                />
              )}
              {tab === 'documentos' && (
                <CustomerDocumentsTab
                  customerId={customerId}
                  documents={documents ?? []}
                  isLoading={documentsLoading}
                />
              )}
              {tab === 'notas' && (
                <CustomerNotesTab
                  customerId={customerId}
                  customerName={customer.name}
                  notes={notes ?? []}
                  isLoading={notesLoading}
                />
              )}
            </ListTabs>
          </section>
        </div>
      </div>

      <CustomerServiceDialog
        customerId={customerId}
        parentId={serviceTarget.mode === 'create' ? serviceTarget.parentId : undefined}
        service={serviceTarget.mode === 'edit' ? serviceTarget.service : undefined}
        duplicateOf={serviceTarget.mode === 'duplicate' ? serviceTarget.service : undefined}
        open={serviceDialogOpen}
        onOpenChange={setServiceDialogOpen}
      />
    </PageContainer>
  );
}
