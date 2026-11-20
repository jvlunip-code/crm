'use client';

import * as React from 'react';
import { Avatar as AvatarPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

export type AvatarSize = 'sm' | 'default' | 'md' | 'lg' | 'tile' | 'xl';
export type AvatarFill = 1 | 2 | 3 | 4;

/** Pastel fill for an entity id (DESIGN.md › Avatars: `id % 4`). */
export function avatarFillFor(id: number): AvatarFill {
  return ((((Math.trunc(id) % 4) + 4) % 4) + 1) as AvatarFill;
}

/**
 * Initials avatar on the pastel fills `avatar-1..4` (Oat, Coral, Heather,
 * Cactus), no ring. Sizes: `sm` 24 · `default` 32 · `md` 36 · `lg` 40 ·
 * `tile` 40 square (r10, company tile) · `xl` 72 (profile, serif initials).
 * Set `aria-hidden` when the name is rendered next to it.
 */
function Avatar({
  className,
  size = 'default',
  fill = 1,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: AvatarSize;
  fill?: AvatarFill;
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      data-fill={fill}
      className={cn(
        'group/avatar relative flex size-8 shrink-0 rounded-full select-none data-[size=lg]:size-10 data-[size=md]:size-9 data-[size=sm]:size-6 data-[size=tile]:size-10 data-[size=tile]:rounded-md data-[size=xl]:size-18',
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full rounded-[inherit] object-cover', className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-[inherit] bg-avatar-1 type-caption font-semibold text-foreground',
        'group-data-[fill=2]/avatar:bg-avatar-2 group-data-[fill=3]/avatar:bg-avatar-3 group-data-[fill=4]/avatar:bg-avatar-4',
        // initials per size (tokens.json › type.avatar)
        'group-data-[size=sm]/avatar:text-[10px] group-data-[size=sm]/avatar:leading-none',
        'group-data-[size=lg]/avatar:type-body group-data-[size=lg]/avatar:font-semibold group-data-[size=tile]/avatar:type-body group-data-[size=tile]/avatar:font-semibold',
        'group-data-[size=xl]/avatar:font-heading group-data-[size=xl]/avatar:text-[26px] group-data-[size=xl]/avatar:leading-none group-data-[size=xl]/avatar:font-normal',
        className,
      )}
      {...props}
    />
  );
}

function AvatarBadge({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        'absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card select-none',
        'group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden',
        'group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2',
        'group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2',
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        'group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-card',
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        'relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted type-caption text-foreground-secondary ring-2 ring-card group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6',
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge };
