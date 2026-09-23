import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { SiteHeader } from './SiteHeader';

/**
 * Flat shell: 192px navigation surface, 65px header, fluid canvas.
 *
 * --header-height tracks the sidebar header (p-2 + the h-12 brand button + its
 * 1px border-b) so the two bottom borders meet in one line.
 */
export function Layout() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '12rem',
          '--header-height': 'calc(4rem + 1px)',
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      {/* min-w-0 lets wide content scroll inside its own container instead of
          stretching the whole main area past the viewport. */}
      <SidebarInset className="min-w-0">
        <SiteHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
