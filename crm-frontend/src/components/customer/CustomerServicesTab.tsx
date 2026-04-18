import * as React from 'react'
import { Plus, MoreVertical, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDeleteCustomerService } from '@/hooks/use-customer-services'
import { CustomerServiceDialog } from '@/components/customer/CustomerServiceDialog'
import type { CustomerService } from '@/types'
import { toast } from 'sonner'

function formatServiceDate(value: string | null | undefined): string {
  if (!value) return '—'
  const [y, m, d] = value.split('-')
  return y && m && d ? `${d}/${m}/${y}` : value
}

interface CustomerServicesTabProps {
  customerId: number
  services: CustomerService[]
  isLoading?: boolean
}

export function CustomerServicesTab({ customerId, services, isLoading }: CustomerServicesTabProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set())
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingService, setEditingService] = React.useState<CustomerService | undefined>()
  const [parentIdForNew, setParentIdForNew] = React.useState<number | undefined>()
  const deleteService = useDeleteCustomerService()

  const parentServices = services.filter(s => !s.parentId)
  const getChildren = (parentId: number) => services.filter(s => s.parentId === parentId)

  const toggleExpand = (id: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleCreate = () => {
    setEditingService(undefined)
    setParentIdForNew(undefined)
    setDialogOpen(true)
  }

  const handleCreateSubService = (parentId: number) => {
    setEditingService(undefined)
    setParentIdForNew(parentId)
    setDialogOpen(true)
  }

  const handleEdit = (service: CustomerService) => {
    setEditingService(service)
    setParentIdForNew(undefined)
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteService.mutateAsync({ id, customerId })
      toast.success('Serviço eliminado com sucesso')
    } catch {
      toast.error('Erro ao eliminar serviço')
    }
  }

  const formatCurrency = (valor: number, moeda: string) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: moeda,
    }).format(valor)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">A carregar serviços...</p>
        </CardContent>
      </Card>
    )
  }

  const renderServiceRow = (service: CustomerService, isChild: boolean = false) => {
    const children = getChildren(service.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedRows.has(service.id)

    return (
      <React.Fragment key={service.id}>
        <TableRow className={isChild ? 'bg-muted/30' : undefined}>
          <TableCell className="font-medium">
            <div className={`flex items-center gap-2 ${isChild ? 'pl-6' : ''}`}>
              {!isChild && hasChildren ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleExpand(service.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : !isChild ? (
                <span className="inline-block w-6" />
              ) : null}
              {service.acesso}
            </div>
          </TableCell>
          <TableCell>{service.tarifario}</TableCell>
          <TableCell>{service.operadora}</TableCell>
          <TableCell>{formatCurrency(service.valor, service.moeda)}</TableCell>
          <TableCell>{service.conta}</TableCell>
          <TableCell>{formatServiceDate(service.dataFim)}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Ações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleEdit(service)}>
                  Editar
                </DropdownMenuItem>
                {!isChild && (
                  <DropdownMenuItem onClick={() => handleCreateSubService(service.id)}>
                    Adicionar Sub-serviço
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleDelete(service.id)}
                >
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {!isChild && isExpanded && children.map(child => renderServiceRow(child, true))}
      </React.Fragment>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Serviços</CardTitle>
              <CardDescription>
                Serviços contratados para este cliente
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Serviço
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {parentServices.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground text-sm">Sem serviços</p>
              <Button
                variant="link"
                size="sm"
                className="mt-2"
                onClick={handleCreate}
              >
                Criar primeiro serviço
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead>Acesso (ID)</TableHead>
                    <TableHead>Tarifário</TableHead>
                    <TableHead>Operadora</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Data Fim</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parentServices.map(service => renderServiceRow(service))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerServiceDialog
        customerId={customerId}
        parentId={parentIdForNew}
        service={editingService}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
