import * as React from 'react';
import { tagDotClass } from '@/lib/tags';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types';

/** 8px coloured dot, as in Finder. Decorative: always pair it with the tag name. */
export function TagDot({ color, className }: { color: Tag['color']; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-2 shrink-0 rounded-full', tagDotClass(color), className)}
    />
  );
}

/**
 * Classes for the dashed "+ Adicionar etiqueta" pill that sits after the
 * chips (use on the picker's trigger button so it matches `TagChip`).
 */
export const tagAddChipClass =
  'inline-flex h-auto items-center gap-1.5 rounded-full border border-dashed border-border-strong bg-transparent px-2.5 py-1 type-dense text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-3.5';

/** Customer tag: 8px dot + name on the neutral chip (no status meaning). */
export function TagChip({
  tag,
  className,
  ...props
}: React.ComponentProps<'span'> & { tag: Pick<Tag, 'name' | 'color'> }) {
  return (
    <span
      data-slot="tag-chip"
      className={cn(
        'inline-flex max-w-48 items-center gap-1.5 rounded-full bg-chip px-2.5 py-1 type-dense text-chip-foreground',
        className,
      )}
      {...props}
    >
      <TagDot color={tag.color} />
      <span className="truncate">{tag.name}</span>
    </span>
  );
}
