import * as React from 'react';

import {
  Avatar,
  AvatarFallback,
  avatarFillFor,
  type AvatarSize,
} from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

/** Up to two initials: first and last word ("Maria da Silva" → "MS"). */
function initialsOf(name: string | null | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0][0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1][0] ?? '') : '';
  return (first + last).toLocaleUpperCase('pt-PT');
}

/**
 * Initials on a pastel fill picked by `id % 4` (stable per entity, not per
 * row). Sizes: `sm` 24 · `default` 32 · `md` 36 · `lg` 40 · `tile` 40 square
 * · `xl` 72 (serif initials). Decorative by default (`aria-hidden`), since the
 * name is normally rendered next to it; pass `decorative={false}` when it
 * stands alone and it is announced as the name.
 */
export function InitialsAvatar({
  name,
  id,
  size = 'default',
  decorative = true,
  className,
}: {
  name: string | null | undefined;
  /** Entity id that picks the fill; without it the first fill (Oat) is used. */
  id?: number | null;
  size?: AvatarSize;
  decorative?: boolean;
  className?: string;
}) {
  const a11y: React.AriaAttributes & { role?: string } = decorative
    ? { 'aria-hidden': true }
    : { role: 'img', 'aria-label': name ?? undefined };

  return (
    <Avatar
      size={size}
      fill={id == null ? 1 : avatarFillFor(id)}
      className={cn(className)}
      {...a11y}
    >
      <AvatarFallback>{initialsOf(name)}</AvatarFallback>
    </Avatar>
  );
}
