import { useNavigate } from 'react-router-dom';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, avatarFillFor } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth, useLogout } from '@/hooks/use-auth';

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/**
 * Sidebar user card (DESIGN.md › Shell): white, r12, hairline, 32px avatar,
 * name + email. The whole card opens the account menu.
 */
export function NavUser() {
  const { isMobile } = useSidebar();
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  if (!user) return null;

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate('/login'),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent data-[state=open]:bg-accent"
        >
          <Avatar fill={avatarFillFor(user.id)} aria-hidden>
            <AvatarFallback>{initialsOf(name)}</AvatarFallback>
          </Avatar>
          <span className="grid min-w-0 flex-1">
            <span className="truncate type-body font-medium text-foreground">{name}</span>
            {user.email && (
              <span className="truncate type-caption text-muted-foreground">{user.email}</span>
            )}
          </span>
          <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
        side={isMobile ? 'top' : 'right'}
        align="end"
        sideOffset={8}
      >
        <DropdownMenuItem onSelect={handleLogout} disabled={logout.isPending}>
          <LogOut aria-hidden />
          Terminar sessão
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
