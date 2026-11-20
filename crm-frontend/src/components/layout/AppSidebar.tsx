import { useId } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Bell, LayoutDashboard, Package, Users } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { BrandMark } from '@/components/layout/BrandMark';
import { NavUser } from '@/components/layout/NavUser';
import { NotificationsBell } from '@/components/layout/NotificationsBell';
import { useUnreadCount } from '@/hooks/use-notifications';

const navMain = [
  { title: 'Painel', url: '/', icon: LayoutDashboard },
  { title: 'Clientes', url: '/customers', icon: Users },
  { title: 'Serviços', url: '/services', icon: Package },
  { title: 'Notificações', url: '/notifications', icon: Bell, hasBadge: true },
  { title: 'Eventos', url: '/events', icon: Activity },
];

const isActive = (pathname: string, url: string) =>
  url === '/' ? pathname === '/' : pathname === url || pathname.startsWith(`${url}/`);

/**
 * Hearth sidebar (DESIGN.md › Shell): brand row with the notifications bell,
 * "Área de trabalho" nav, user card at the bottom. On mobile the same content
 * opens as a sheet from the top bar, which carries its own bell.
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const { data: unreadCount = 0 } = useUnreadCount();
  const navLabelId = useId();

  // In the mobile sheet, following a link should reveal the page.
  const closeSheet = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="flex-row items-center justify-between gap-2">
        <Link
          to="/"
          onClick={closeSheet}
          className="ml-3 flex min-h-9 items-center gap-2.5 rounded-sm text-foreground"
        >
          <BrandMark />
          <span className="type-heading">JVL</span>
        </Link>
        {!isMobile && <NotificationsBell side="right" align="start" />}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <nav aria-labelledby={navLabelId}>
            <SidebarGroupLabel id={navLabelId}>Área de trabalho</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navMain.map((item) => {
                  const active = isActive(pathname, item.url);
                  const showBadge = item.hasBadge && unreadCount > 0;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link
                          to={item.url}
                          aria-current={active ? 'page' : undefined}
                          onClick={closeSheet}
                        >
                          <item.icon aria-hidden />
                          <span>{item.title}</span>
                          {showBadge && <span className="sr-only">, {unreadCount} por ler</span>}
                        </Link>
                      </SidebarMenuButton>
                      {showBadge && (
                        <SidebarMenuBadge aria-hidden>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </nav>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
