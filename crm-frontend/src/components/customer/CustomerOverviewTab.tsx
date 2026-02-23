import { useState } from 'react'
import { Mail, Phone, Building2, Calendar, User, MapPin, Pencil, Plus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CustomerAddressDialog } from './CustomerAddressDialog'
import type { Customer, CustomerAddress } from '@/types'

interface CustomerOverviewTabProps {
  customer: Customer
  customerId: number
  address?: CustomerAddress | null
}

export function CustomerOverviewTab({ customer, customerId, address }: CustomerOverviewTabProps) {
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)

  const initials = customer.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Informação pessoal do cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-semibold">{customer.name}</h3>
              <p className="text-muted-foreground text-sm">{customer.company}</p>
              <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                {customer.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informação de Contacto</CardTitle>
          <CardDescription>Como contactar este cliente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md">
              <Mail className="text-muted-foreground h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Email</p>
              <a
                href={`mailto:${customer.email}`}
                className="text-sm font-medium hover:underline"
              >
                {customer.email}
              </a>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md">
              <Phone className="text-muted-foreground h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Telefone</p>
              <a
                href={`tel:${customer.phone}`}
                className="text-sm font-medium hover:underline"
              >
                {customer.phone}
              </a>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md">
              <Building2 className="text-muted-foreground h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Empresa</p>
              <p className="text-sm font-medium">{customer.company}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Detalhes da Conta</CardTitle>
          <CardDescription>Informação da conta do cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md">
                <User className="text-muted-foreground h-4 w-4" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">ID do Cliente</p>
                <p className="text-sm font-medium">#{customer.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md">
                <Calendar className="text-muted-foreground h-4 w-4" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Criado</p>
                <p className="text-sm font-medium">
                  {new Date(customer.createdAt).toLocaleDateString('pt-PT', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md">
                <div
                  className={`h-2 w-2 rounded-full ${
                    customer.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Estado</p>
                <p className="text-sm font-medium capitalize">{customer.status === 'active' ? 'Ativo' : 'Inativo'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Morada</CardTitle>
              <CardDescription>Endereço do cliente</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddressDialogOpen(true)}
            >
              {address ? (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {address ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md">
                  <MapPin className="text-muted-foreground h-4 w-4" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Morada</p>
                  <p className="text-sm font-medium">{address.street}</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Código Postal</p>
                    <p className="text-sm font-medium">{address.postalCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md">
                    <Building2 className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Cidade</p>
                    <p className="text-sm font-medium">{address.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Distrito</p>
                    <p className="text-sm font-medium">{address.district}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">País</p>
                    <p className="text-sm font-medium">{address.country}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-20 flex-col items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground text-sm">Sem morada registada</p>
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerAddressDialog
        customerId={customerId}
        address={address}
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
      />
    </div>
  )
}
