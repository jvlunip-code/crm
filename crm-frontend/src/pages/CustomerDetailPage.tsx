import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCustomer } from '@/hooks/use-customers'
import { useCustomerServices } from '@/hooks/use-customer-services'
import { useCustomerNotes } from '@/hooks/use-customer-notes'
import { useCustomerDocuments } from '@/hooks/use-customer-documents'
import { useCustomerAddress } from '@/hooks/use-customer-address'
import { CustomerHeader } from '@/components/customer/CustomerHeader'
import { CustomerSummaryCards } from '@/components/customer/CustomerSummaryCards'
import { CustomerOverviewTab } from '@/components/customer/CustomerOverviewTab'
import { CustomerServicesTab } from '@/components/customer/CustomerServicesTab'
import { CustomerNotesTab } from '@/components/customer/CustomerNotesTab'
import { CustomerDocumentsTab } from '@/components/customer/CustomerDocumentsTab'

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const customerId = Number(id)

  const { data: customer, isLoading: customerLoading } = useCustomer(customerId)
  const { data: customerServices, isLoading: servicesLoading } =
    useCustomerServices(customerId)
  const { data: notes, isLoading: notesLoading } = useCustomerNotes(customerId)
  const { data: documents, isLoading: documentsLoading } =
    useCustomerDocuments(customerId)
  const { data: address } = useCustomerAddress(customerId)

  if (customerLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">A carregar cliente...</p>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Cliente não encontrado</p>
        <button
          onClick={() => navigate('/customers')}
          className="text-primary hover:underline"
        >
          Voltar aos clientes
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pb-4">
      <CustomerHeader customer={customer} />

      <CustomerSummaryCards
        customer={customer}
        services={customerServices || []}
        notes={notes || []}
      />

      <div className="px-4 lg:px-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="services">
              Serviços
              {customerServices && customerServices.length > 0 && (
                <span className="bg-muted-foreground/20 ml-2 rounded-full px-2 py-0.5 text-xs">
                  {customerServices.filter(s => !s.parentId).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="notes">
              Notas
              {notes && notes.length > 0 && (
                <span className="bg-muted-foreground/20 ml-2 rounded-full px-2 py-0.5 text-xs">
                  {notes.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="documents">
              Documentos
              {documents && documents.length > 0 && (
                <span className="bg-muted-foreground/20 ml-2 rounded-full px-2 py-0.5 text-xs">
                  {documents.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <CustomerOverviewTab customer={customer} customerId={customerId} address={address} />
          </TabsContent>

          <TabsContent value="services">
            <CustomerServicesTab
              customerId={customerId}
              services={customerServices || []}
              isLoading={servicesLoading}
            />
          </TabsContent>

          <TabsContent value="notes">
            <CustomerNotesTab
              customerId={customerId}
              notes={notes || []}
              isLoading={notesLoading}
            />
          </TabsContent>

          <TabsContent value="documents">
            <CustomerDocumentsTab
              customerId={customerId}
              documents={documents || []}
              isLoading={documentsLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
