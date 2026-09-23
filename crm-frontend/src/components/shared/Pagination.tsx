import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Offset pagination footer: "1–50 de 123" + previous/next. */
export function Pagination({
  offset,
  pageSize,
  total,
  onChange,
  className,
}: {
  offset: number;
  pageSize: number;
  total: number;
  onChange: (offset: number) => void;
  className?: string;
}) {
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + pageSize, total);
  return (
    <nav
      aria-label="Paginação"
      className={cn('flex items-center justify-between gap-3', className)}
    >
      <span className="type-caption text-muted-foreground tabular-nums">
        {from}–{to} de {total}
      </span>
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
    </nav>
  );
}
