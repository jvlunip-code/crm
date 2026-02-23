import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MoreVertical,
  Mail,
  Phone,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Customer } from '@/types'

interface CustomerHeaderProps {
  customer: Customer
}

export function CustomerHeader({ customer }: CustomerHeaderProps) {
  const navigate = useNavigate()

  const initials = customer.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center justify-between px-4 py-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/customers')}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar aos clientes</span>
        </Button>
        <Avatar className="h-12 w-12">
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold lg:text-2xl">{customer.name}</h1>
            <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
              {customer.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{customer.company}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
          <a href={`mailto:${customer.email}`}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </a>
        </Button>
        <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
          <a href={`tel:${customer.phone}`}>
            <Phone className="mr-2 h-4 w-4" />
            Ligar
          </a>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Mais ações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="sm:hidden" asChild>
              <a href={`mailto:${customer.email}`}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="sm:hidden" asChild>
              <a href={`tel:${customer.phone}`}>
                <Phone className="mr-2 h-4 w-4" />
                Ligar
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="sm:hidden" />
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
