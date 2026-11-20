import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { MobileTopBar } from './MobileTopBar';

// The desktop sidebar has no trigger, so it can never be hidden (this also
// neutralises the provider's Cmd/Ctrl+B shortcut). The mobile sheet keeps its
// own `openMobile` state.
const keepOpen = () => {};

/**
 * Hearth shell: 232px sidebar (width set by `ui/sidebar`) and an Ivory canvas
 * with no desktop header. Below 768px a sticky top bar opens the sidebar as a
 * sheet. Pages own their padding (`PageContainer`).
 */
export function Layout() {
  return (
    <SidebarProvider open onOpenChange={keepOpen}>
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        {/* min-w-0 lets wide content scroll inside its own container instead of
            stretching the whole main area past the viewport. */}
        <SidebarInset className="min-h-0 min-w-0">
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
