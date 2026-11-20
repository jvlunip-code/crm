import { cn } from '@/lib/utils';

export interface ColumnDatum {
  key: string;
  /** Short x-axis label ("nov."). */
  label: string;
  /** Full label for screen readers ("novembro de 2026"); defaults to `label`. */
  fullLabel?: string;
  value: number;
}

const NUMBER = new Intl.NumberFormat('pt-PT');

/** Room above the tallest bar for its 12px value label (16px line + 6px gap). */
const LABEL_SPACE = 22;

/**
 * Plain CSS column chart (DESIGN.md › Charts): clay bars rounded 4 4 0 0,
 * 56% of the slot and at most 48px wide, each value printed 12px above its
 * bar, x labels in 12px tertiary under a 1px `border-strong` baseline. Text is
 * fixed-size (no SVG scaling). `highlightIndex` bolds one column (the
 * current month).
 *
 * Accessibility: the bars are one `role="img"` whose label lists every value,
 * and a visually hidden table carries the same data.
 */
export function ColumnChart({
  data,
  title,
  categoryLabel,
  valueLabel,
  highlightIndex,
  height = 168,
  formatValue = (n) => NUMBER.format(n),
  className,
}: {
  data: ColumnDatum[];
  /** What the chart shows; starts the accessible label and the table caption. */
  title: string;
  /** Header of the category column in the hidden table ("Mês"). */
  categoryLabel: string;
  /** Header of the value column in the hidden table ("Serviços"). */
  valueLabel: string;
  highlightIndex?: number;
  /** Plot height in px, value labels included. */
  height?: number;
  formatValue?: (value: number) => string;
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const plot = Math.max(0, height - LABEL_SPACE);
  const summary = `${title}: ${data
    .map((d) => `${d.fullLabel ?? d.label} ${formatValue(d.value)}`)
    .join(', ')}`;

  return (
    <figure data-slot="column-chart" className={cn('flex min-w-0 flex-col gap-2', className)}>
      <div
        role="img"
        aria-label={summary}
        className="flex items-end gap-0.5 border-b-1 border-border-strong tabular-nums"
        style={{ height }}
      >
        {data.map((d, i) => {
          const strong = i === highlightIndex;
          const barHeight = d.value > 0 ? Math.max(2, Math.round((d.value / max) * plot)) : 0;
          return (
            <div
              key={d.key}
              aria-hidden
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span
                className={cn(
                  'type-caption',
                  strong ? 'font-semibold text-foreground' : 'text-muted-foreground',
                )}
              >
                {formatValue(d.value)}
              </span>
              <div
                className="w-14/25 max-w-12 rounded-t-xs bg-brand"
                style={{ height: barHeight }}
              />
            </div>
          );
        })}
      </div>
      <div aria-hidden className="flex gap-0.5">
        {data.map((d, i) => (
          <span
            key={d.key}
            className={cn(
              'min-w-0 flex-1 truncate text-center type-caption',
              i === highlightIndex ? 'font-medium text-foreground' : 'text-foreground-tertiary',
            )}
          >
            {d.label}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">{categoryLabel}</th>
            <th scope="col">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <th scope="row">{d.fullLabel ?? d.label}</th>
              <td>{formatValue(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
