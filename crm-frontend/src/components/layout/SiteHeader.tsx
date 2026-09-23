import { useLocation } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NotificationsBell } from '@/components/layout/NotificationsBell';

const pageTitles: Record<string, string> = {
  '/': 'Painel',
  '/customers': 'Clientes',
  '/services': 'Serviços',
  '/notifications': 'Notificações',
  '/events': 'Eventos',
};

export function SiteHeader() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Painel';

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <NotificationsBell />
        </div>
      </div>
    </header>
  );
}
