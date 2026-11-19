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

/**
 * Offset pagination footer: "1–50 de 123" + previous/next. With
 * `pageSizeOptions` + `onPageSizeChange` it also offers "Linhas por página".
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
  const singlePage = offset === 0 && offset + pageSize >= total;

  return (
    <nav
      aria-label="Paginação"
      className={cn('flex flex-wrap items-center justify-between gap-3', className)}
    >
      <span className="type-caption text-muted-foreground tabular-nums">
        {from}–{to} de {total}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        {showPageSize && (
          <div className="flex items-center gap-2">
            <span id={labelId} className="type-caption text-muted-foreground">
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
        {!(showPageSize && singlePage) && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => onChange(Math.max(0, offset - pageSize))}
            >
              <ChevronLeftIcon aria-hidden />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + pageSize >= total}
              onClick={() => onChange(offset + pageSize)}
            >
              Seguinte
              <ChevronRightIcon aria-hidden />
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
