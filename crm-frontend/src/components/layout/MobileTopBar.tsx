import { Link } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BrandMark } from '@/components/layout/BrandMark';
import { NotificationsBell } from '@/components/layout/NotificationsBell';

/**
 * Below 768px (DESIGN.md › Shell): sticky 56px bar with the menu trigger
 * (opens the sidebar as a sheet), the mark + "JVL", and the bell.
 */
export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar px-2 md:hidden">
      <SidebarTrigger size="icon" className="text-sidebar-foreground" />
      <Link to="/" className="flex min-h-9 items-center gap-2.5 rounded-sm text-foreground">
        <BrandMark />
        <span className="type-heading-sm">JVL</span>
      </Link>
      <NotificationsBell side="bottom" align="end" size="icon" className="ml-auto" />
    </header>
  );
}
