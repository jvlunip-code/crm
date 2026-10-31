import * as React from 'react';
import { tagDotClass } from '@/lib/tags';
import { cn } from '@/lib/utils';
import type { Tag } from '@/types';

/** Coloured dot, as in Finder. Decorative: always pair it with the tag name. */
export function TagDot({ color, className }: { color: Tag['color']; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-2.5 shrink-0 rounded-full', tagDotClass(color), className)}
    />
  );
}

/** Customer tag: coloured dot + name in a quiet pill. */
export function TagChip({
  tag,
  className,
  ...props
}: React.ComponentProps<'span'> & { tag: Pick<Tag, 'name' | 'color'> }) {
  return (
    <span
      className={cn(
        'inline-flex max-w-48 items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 type-caption text-foreground',
        className,
      )}
      {...props}
    >
      <TagDot color={tag.color} />
      <span className="truncate">{tag.name}</span>
    </span>
  );
}
