import { useState } from 'react'
import { Mail, Phone, Building2, Calendar, User, MapPin, Pencil, Plus, Check, X, CreditCard, FileText } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { CustomerAddressDialog } from './CustomerAddressDialog'
import { useUpdateCustomer } from '@/hooks/use-customers'
import type { Customer, CustomerAddress } from '@/types'
import { formatNif } from '@/lib/utils'
import { toast } from 'sonner'

type EditableField = 'email' | 'phone' | 'company' | 'nif' | 'iban'

interface CustomerOverviewTabProps {
  customer: Customer
  customerId: number
  address?: CustomerAddress | null
}

export function CustomerOverviewTab({ customer, customerId, address }: CustomerOverviewTabProps) {
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<EditableField | null>(null)
  const [editValue, setEditValue] = useState('')
  const updateCustomer = useUpdateCustomer()

  const startEditing = (field: EditableField) => {
    setEditingField(field)
    setEditValue(customer[field] ?? '')
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditValue('')
  }

  const saveEdit = async () => {
    if (!editingField) return
    try {
      await updateCustomer.mutateAsync({ id: customer.id, updates: { [editingField]: editValue || null } })
      toast.success('Dados atualizados com sucesso')
      setEditingField(null)
      setEditValue('')
    } catch {
      toast.error('Erro ao atualizar dados')
    }
  }

  const initials = customer.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  const renderEditableField = (
    field: EditableField,
    label: string,
    icon: React.ReactNode,
    displayValue: React.ReactNode,
  ) => {
    const isEditing = editingField === field

    return (
      <div className="flex items-center gap-3">
        <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs">{label}</p>
          {isEditing ? (
            <div className="flex items-center gap-1">
              {field === 'phone' ? (
                <PhoneInput
                  value={editValue}
                  onChange={setEditValue}
                  className="flex-1"
                />
              ) : field === 'nif' ? (
                <Input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  className="h-7 text-sm"
                  maxLength={9}
                  placeholder="123456789"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEdit()
                    if (e.key === 'Escape') cancelEditing()
                  }}
                />
              ) : (
                <Input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className="h-7 text-sm"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEdit()
                    if (e.key === 'Escape') cancelEditing()
                  }}
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={saveEdit}
                disabled={updateCustomer.isPending}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={cancelEditing}
                disabled={updateCustomer.isPending}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="min-w-0 flex-1">{displayValue}</div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 opacity-0 group-hover/field:opacity-100 transition-opacity"
                onClick={() => startEditing(field)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

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
          <Separator className="my-4" />
          <div className="space-y-3">
            <div className="group/field">
              {renderEditableField(
                'nif',
                'NIF',
                <FileText className="text-muted-foreground h-4 w-4" />,
                <p className="text-sm font-medium">{formatNif(customer.nif)}</p>,
              )}
            </div>
            <div className="group/field">
              {renderEditableField(
                'iban',
                'IBAN',
                <CreditCard className="text-muted-foreground h-4 w-4" />,
                <p className="text-sm font-medium">{customer.iban ?? '—'}</p>,
              )}
            </div>
            <div className="group/field">
              {renderEditableField(
                'company',
                'Empresa',
                <Building2 className="text-muted-foreground h-4 w-4" />,
                <p className="text-sm font-medium">{customer.company}</p>,
              )}
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
          <div className="group/field">
            {renderEditableField(
              'email',
              'Email',
              <Mail className="text-muted-foreground h-4 w-4" />,
              <a href={`mailto:${customer.email}`} className="text-sm font-medium hover:underline">
                {customer.email}
              </a>,
            )}
          </div>
          <Separator />
          <div className="group/field">
            {renderEditableField(
              'phone',
              'Telefone',
              <Phone className="text-muted-foreground h-4 w-4" />,
              <a href={`tel:${customer.phone}`} className="text-sm font-medium hover:underline">
                {customer.phone}
              </a>,
            )}
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
                <p className="text-muted-foreground text-xs">NIF</p>
                <p className="text-sm font-medium">{formatNif(customer.nif)}</p>
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
                <div className="flex items-center gap-2">
                  <Switch
                    checked={customer.status === 'active'}
                    onCheckedChange={async (checked: boolean) => {
                      try {
                        await updateCustomer.mutateAsync({
                          id: customer.id,
                          updates: { status: checked ? 'active' : 'inactive' },
                        })
                        toast.success(checked ? 'Cliente ativado' : 'Cliente desativado')
                      } catch {
                        toast.error('Erro ao atualizar estado')
                      }
                    }}
                    disabled={updateCustomer.isPending}
                  />
                  <span className="text-sm font-medium">{customer.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                </div>
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
                    <p className="text-muted-foreground text-xs">Concelho</p>
                    <p className="text-sm font-medium">{address.municipality}</p>
                  </div>
                </div>
                {address.parish && (
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Freguesia ou Localidade</p>
                      <p className="text-sm font-medium">{address.parish}</p>
                    </div>
                  </div>
                )}
                {address.district && (
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Distrito</p>
                      <p className="text-sm font-medium">{address.district}</p>
                    </div>
                  </div>
                )}
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
