import { Coins, Package, FileText, Calendar } from 'lucide-react'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Customer, CustomerService, CustomerNote } from '@/types'

interface CustomerSummaryCardsProps {
  customer: Customer
  services: CustomerService[]
  notes: CustomerNote[]
}

export function CustomerSummaryCards({
  customer,
  services,
  notes,
}: CustomerSummaryCardsProps) {
  const parentServices = services.filter(s => !s.parentId)

  const totalValor = services.reduce((total, s) => total + s.valor, 0)

  const memberSince = new Date(customer.createdAt).toLocaleDateString('pt-PT', {
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Gasto Mensal
          </CardDescription>
          <CardTitle className="text-2xl">{totalValor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Serviços Ativos
          </CardDescription>
          <CardTitle className="text-2xl">{parentServices.length}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Total de Notas
          </CardDescription>
          <CardTitle className="text-2xl">{notes.length}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Membro Desde
          </CardDescription>
          <CardTitle className="text-2xl">{memberSince}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
