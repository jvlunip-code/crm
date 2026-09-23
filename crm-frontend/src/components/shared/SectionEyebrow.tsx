import { cn } from '@/lib/utils';

interface SectionEyebrowProps {
  index?: string;
  label: string;
  trailing?: string;
  className?: string;
}

/** Section label with a dashed rule — groups content without another card. */
export function SectionEyebrow({ index, label, trailing, className }: SectionEyebrowProps) {
  return (
    <div className={cn('flex items-center gap-3 type-eyebrow text-muted-foreground', className)}>
      {index && <span className="type-mono font-medium text-foreground">{index}</span>}
      <span className="text-foreground-secondary">{label}</span>
      <span aria-hidden className="h-0 flex-1 border-t border-dashed border-border-dashed" />
      {trailing && (
        <span className="hidden tabular-nums normal-case tracking-normal md:inline">
          {trailing}
        </span>
      )}
    </div>
  );
}
