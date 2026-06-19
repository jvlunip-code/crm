import { TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCustomers } from '@/hooks/use-customers'
import { useServices } from '@/hooks/use-services'
import { useUnreadCount } from '@/hooks/use-notifications'
import { useEvents } from '@/hooks/use-events'

export function SectionCards() {
  const { data: customers } = useCustomers()
  const { data: services } = useServices()
  const { data: unreadNotifications = 0 } = useUnreadCount()
  const { data: events } = useEvents()

  const activeCustomers = customers?.filter(c => c.status === 'active').length || 0
  const totalCustomers = customers?.length || 0
  const activeServices = services?.filter(s => s.status === 'active').length || 0
  const recentEvents = events?.slice(0, 30).length || 0

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de Clientes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalCustomers}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="size-3" />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {activeCustomers} clientes ativos <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Base de clientes em crescimento este mês
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Serviços Ativos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activeServices}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="size-3" />
              +8.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Adoção de serviços em tendência crescente <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Envolvimento supera as metas
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Notificações por Ler</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {unreadNotifications}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {unreadNotifications > 5 ? (
                <>
                  <TrendingDown className="size-3" />
                  Necessita atenção
                </>
              ) : (
                <>
                  <TrendingUp className="size-3" />
                  Sob controlo
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {unreadNotifications > 0 ? 'Rever itens pendentes' : 'Tudo em dia!'}{' '}
            {unreadNotifications > 5 ? (
              <TrendingDown className="size-4" />
            ) : (
              <TrendingUp className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Mantenha-se atualizado com as novidades
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Eventos Recentes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {recentEvents}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="size-3" />
              Ativo
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Atividade do sistema saudável <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Últimos 30 dias de atividade
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
