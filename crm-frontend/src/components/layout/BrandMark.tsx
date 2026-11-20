import { cn } from '@/lib/utils';

/**
 * JVL mark (PLAN.md decision 4): 28px clay square, r8, with a 10px Ivory dot.
 * Decorative; the "JVL" wordmark next to it carries the name.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-sm bg-brand',
        className,
      )}
    >
      <span className="size-2.5 rounded-full bg-background" />
    </span>
  );
}
