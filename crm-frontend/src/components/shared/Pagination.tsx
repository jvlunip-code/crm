import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { pageSizeLabel } from '@/lib/pagination';
import { cn } from '@/lib/utils';

const NUMBER = new Intl.NumberFormat('pt-PT');

/** 36px r8 page button with a 44px hit area on coarse pointers. */
const pageButtonClass =
  "relative h-9 min-w-9 rounded-sm px-2 tabular-nums pointer-coarse:after:absolute pointer-coarse:after:-inset-1 pointer-coarse:after:content-['']";

type PageSlot = number | 'gap-start' | 'gap-end';

/** 1 … p−1 p p+1 … N, always 7 slots once there are more than 7 pages. */
function pageWindow(current: number, count: number): PageSlot[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, 'gap-end', count];
  if (current >= count - 3) return [1, 'gap-start', count - 4, count - 3, count - 2, count - 1, count];
  return [1, 'gap-start', current - 1, current, current + 1, 'gap-end', count];
}

/**
 * Offset pagination footer (DESIGN.md › Components): "A mostrar 1–10 de 532"
 * on the left; previous/next (outlined 36px), numbered pages (current = Slate
 * fill) with ellipses on the right. Below `sm` the numbers collapse to
 * "Página x de y". With `pageSizeOptions` + `onPageSizeChange` it also offers
 * "Linhas por página". Put it in a `TableCard` footer.
 */
export function Pagination({
  offset,
  pageSize,
  total,
  onChange,
  pageSizeOptions,
  onPageSizeChange,
  className,
}: {
  offset: number;
  pageSize: number;
  total: number;
  onChange: (offset: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}) {
  const labelId = React.useId();
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + pageSize, total);
  const showPageSize = pageSizeOptions && pageSizeOptions.length > 0 && onPageSizeChange;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(pageCount, Math.floor(offset / pageSize) + 1);
  const goTo = (page: number) => onChange((page - 1) * pageSize);

  return (
    <nav
      aria-label="Paginação"
      className={cn('flex flex-wrap items-center justify-between gap-x-4 gap-y-3', className)}
    >
      <span className="type-body text-muted-foreground tabular-nums" aria-live="polite">
        {total === 0 ? (
          'Sem resultados'
        ) : (
          <>
            A mostrar{' '}
            <span className="font-medium text-foreground">
              {NUMBER.format(from)}–{NUMBER.format(to)}
            </span>{' '}
            de {NUMBER.format(total)}
          </>
        )}
      </span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {showPageSize && (
          <div className="flex items-center gap-2">
            <span id={labelId} className="type-body text-muted-foreground">
              Linhas por página
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger size="sm" className="w-20" aria-labelledby={labelId}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {pageSizeLabel(size)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {pageCount > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className={cn(pageButtonClass, 'px-0')}
              aria-label="Página anterior"
              disabled={current <= 1}
              onClick={() => goTo(current - 1)}
            >
              <ChevronLeftIcon aria-hidden className="size-3.5" />
            </Button>
            <span className="px-2 type-body text-muted-foreground tabular-nums sm:hidden">
              Página {current} de {pageCount}
            </span>
            <ul className="hidden items-center gap-1 sm:flex">
              {pageWindow(current, pageCount).map((slot) =>
                typeof slot === 'number' ? (
                  <li key={slot}>
                    <Button
                      variant={slot === current ? 'default' : 'ghost'}
                      className={cn(pageButtonClass, slot !== current && 'font-normal text-foreground')}
                      aria-label={`Página ${slot}`}
                      aria-current={slot === current ? 'page' : undefined}
                      onClick={() => slot !== current && goTo(slot)}
                    >
                      {NUMBER.format(slot)}
                    </Button>
                  </li>
                ) : (
                  <li key={slot} aria-hidden className="px-1.5 text-foreground-tertiary">
                    …
                  </li>
                ),
              )}
            </ul>
            <Button
              variant="outline"
              className={cn(pageButtonClass, 'px-0')}
              aria-label="Página seguinte"
              disabled={current >= pageCount}
              onClick={() => goTo(current + 1)}
            >
              <ChevronRightIcon aria-hidden className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
