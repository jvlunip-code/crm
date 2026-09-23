import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  Bell,
  CircleDot,
  HelpCircle,
  LayoutDashboard,
  Package,
  Settings,
  Users,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/layout/NavUser';
import { useUnreadCount } from '@/hooks/use-notifications';

const navMain = [
  { title: 'Painel', url: '/', icon: LayoutDashboard },
  { title: 'Clientes', url: '/customers', icon: Users },
  { title: 'Serviços', url: '/services', icon: Package },
  { title: 'Notificações', url: '/notifications', icon: Bell, hasBadge: true },
  { title: 'Eventos', url: '/events', icon: Activity },
];

// Not implemented yet: rendered as inert items, not links.
const navSecondary = [
  { title: 'Definições', icon: Settings },
  { title: 'Ajuda', icon: HelpCircle },
];

const isActive = (pathname: string, url: string) =>
  url === '/' ? pathname === '/' : pathname === url || pathname.startsWith(`${url}/`);

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation();
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
                  <CircleDot className="size-4" />
                </div>
                <div className="grid flex-1 text-left type-nav leading-tight">
                  <span className="truncate font-medium text-foreground">Sistema CRM</span>
                  <span className="truncate type-caption text-foreground-secondary">
                    Gestão de clientes
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(pathname, item.url)}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.hasBadge && unreadCount > 0 && (
                    <SidebarMenuBadge>{unreadCount > 99 ? '99+' : unreadCount}</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
