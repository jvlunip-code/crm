import * as React from 'react';
import { Input } from '@/components/ui/input';
import { foldText, highlightParts } from '@/lib/highlight';
import { cn } from '@/lib/utils';

/**
 * Best `limit` options for `query`: every whitespace-separated token must
 * appear (ignoring case and accents); options starting with the query come
 * first, then those with a word starting with it, then the rest.
 */
function rankOptions(options: string[], query: string, limit: number): string[] {
  const q = foldText(query.trim());
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const scored: { option: string; score: number }[] = [];
  for (const option of options) {
    const folded = foldText(option);
    if (!tokens.every((t) => folded.includes(t))) continue;
    const score = folded.startsWith(q)
      ? 0
      : new RegExp(`(^|\\s)${escapeRegExp(tokens[0])}`).test(folded)
        ? 1
        : 2;
    scored.push({ option, score });
  }
  scored.sort(
    (a, b) =>
      a.score - b.score ||
      a.option.length - b.option.length ||
      a.option.localeCompare(b.option, 'pt'),
  );
  return scored.slice(0, limit).map((s) => s.option);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Free-text input with suggestions from a known list (WAI-ARIA combobox).
 * Typing filters `options` locally; ↑/↓ move, Enter picks the highlighted
 * suggestion (otherwise the form submits as usual), Esc closes the list
 * without closing an enclosing dialog. Any text is accepted.
 */
export function AutocompleteInput({
  value,
  onChange,
  options,
  limit = 8,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  limit?: number;
}) {
  const listId = React.useId();
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);

  const suggestions = React.useMemo(
    () => rankOptions(options, value, limit),
    [options, value, limit],
  );
  // Nothing to suggest once the value is exactly the only match.
  const onlyExact = suggestions.length === 1 && suggestions[0] === value.trim();
  const expanded = open && suggestions.length > 0 && !onlyExact;

  // Esc must close the list, not the dialog around it: Radix listens on the
  // document in the capture phase, so intercept earlier, on window.
  React.useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [expanded]);

  const pick = (option: string) => {
    onChange(option);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (suggestions.length === 0) return;
      event.preventDefault();
      setOpen(true);
      const step = event.key === 'ArrowDown' ? 1 : -1;
      // Cycle through "nothing highlighted" (-1) and the suggestions.
      const states = suggestions.length + 1;
      setActive((i) => ((i + 1 + step + states) % states) - 1);
    } else if (event.key === 'Enter' && expanded && active >= 0) {
      event.preventDefault();
      pick(suggestions[active]);
    }
  };

  const optionId = (i: number) => `${listId}-option-${i}`;

  return (
    <div className={cn('relative', className)}>
      <Input
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
        autoComplete="off"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        {...props}
      />
      {expanded && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full right-0 left-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-popover py-1 text-popover-foreground shadow-1"
          // Keep focus in the input when clicking inside the list.
          onMouseDown={(event) => event.preventDefault()}
        >
          {suggestions.map((option, i) => (
            <li
              key={option}
              id={optionId(i)}
              role="option"
              aria-selected={active === i}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(option)}
              className={cn(
                'cursor-pointer truncate px-3 py-1.5 type-dense',
                active === i && 'bg-accent',
              )}
            >
              {highlightParts(option, value).map((part, j) =>
                part.match ? (
                  <mark key={j} className="rounded-xs bg-highlight text-foreground">
                    {part.text}
                  </mark>
                ) : (
                  part.text
                ),
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
