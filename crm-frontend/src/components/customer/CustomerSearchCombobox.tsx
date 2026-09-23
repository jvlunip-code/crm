import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, Search } from 'lucide-react';
import { SearchField } from '@/components/shared/SearchField';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useCustomerSuggestions } from '@/hooks/use-customers';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { CustomerSuggestion } from '@/lib/api-client';
import { highlightParts } from '@/lib/highlight';
import { getStatusTone } from '@/lib/status';
import { cn, formatNif, getStatusLabel } from '@/lib/utils';

const MIN_LENGTH = 2;
const DEBOUNCE_MS = 150;

/**
 * Customer search with suggestions while typing (WAI-ARIA combobox). Focus
 * stays in the input: ↑/↓ move through the options, Enter opens the
 * highlighted customer — or, with nothing highlighted, submits the enclosing
 * form (the full, paginated search). Esc closes the list, then clears.
 */
export function CustomerSearchCombobox({
  value,
  onChange,
  onClear,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  className?: string;
}) {
  const navigate = useNavigate();
  const listId = React.useId();
  const [open, setOpen] = React.useState(false);
  const term = useDebouncedValue(value, DEBOUNCE_MS);
  // The highlighted option belongs to the term it was chosen for; a new term
  // starts with nothing highlighted.
  const [highlight, setHighlight] = React.useState({ term, index: -1 });
  const active = highlight.term === term ? highlight.index : -1;
  const setActive = (update: number | ((index: number) => number)) =>
    setHighlight((h) => {
      const current = h.term === term ? h.index : -1;
      return { term, index: typeof update === 'function' ? update(current) : update };
    });
  const typed = value.trim().length >= MIN_LENGTH;
  const { data, isFetching, isError } = useCustomerSuggestions(term);
  const results = typed && data ? data.results : [];
  // The last option is always "see all results" (full search).
  const optionCount = results.length + 1;
  const expanded = open && typed;

  const openCustomer = (customer: CustomerSuggestion) => {
    setOpen(false);
    navigate(`/customers/${customer.id}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!typed) return;
      event.preventDefault();
      setOpen(true);
      const step = event.key === 'ArrowDown' ? 1 : -1;
      // Cycle through "nothing highlighted" (-1) and the options.
      const states = optionCount + 1;
      setActive((i) => ((i + 1 + step + states) % states) - 1);
    } else if (event.key === 'Enter') {
      if (expanded && active >= 0 && active < results.length) {
        event.preventDefault();
        openCustomer(results[active]);
      } else {
        // Plain Enter (or the "see all" option): let the form submit.
        setOpen(false);
      }
    } else if (event.key === 'Escape') {
      if (expanded) {
        event.preventDefault();
        setOpen(false);
      } else if (value) {
        onClear();
      }
    }
  };

  const optionId = (i: number) => `${listId}-option-${i}`;

  return (
    <div className={cn('relative', className)}>
      <SearchField
        role="combobox"
        aria-label="Procurar clientes"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        onClear={() => {
          onClear();
          setOpen(false);
        }}
        placeholder="Procurar por nome, empresa, NIF, email, telefone ou morada…"
      />

      {expanded && (
        <div
          className="absolute top-full right-0 left-0 z-30 mt-1 min-w-72 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-1"
          // Keep focus in the input when clicking inside the list.
          onMouseDown={(event) => event.preventDefault()}
        >
          {data?.fuzzy && results.length > 0 && (
            <p className="border-b border-border-subtle px-3 py-1.5 type-caption text-muted-foreground">
              Sem correspondência exata — resultados aproximados
            </p>
          )}
          <ul
            id={listId}
            role="listbox"
            aria-label="Sugestões de clientes"
            className="max-h-96 overflow-y-auto py-1"
          >
            {results.map((customer, i) => (
              <SuggestionOption
                key={customer.id}
                id={optionId(i)}
                customer={customer}
                query={term}
                fuzzy={!!data?.fuzzy}
                active={active === i}
                onHover={() => setActive(i)}
                onSelect={() => openCustomer(customer)}
              />
            ))}
            {results.length === 0 && (
              <li className="px-3 py-2 type-body text-muted-foreground" aria-live="polite">
                {isError
                  ? 'Não foi possível obter sugestões.'
                  : isFetching || term.trim() !== value.trim()
                    ? 'A procurar…'
                    : 'Nenhum cliente encontrado.'}
              </li>
            )}
            <li
              id={optionId(results.length)}
              role="option"
              aria-selected={active === results.length}
              onMouseEnter={() => setActive(results.length)}
              onClick={(event) => {
                setOpen(false);
                event.currentTarget.closest('form')?.requestSubmit();
              }}
              className={cn(
                'mt-1 flex cursor-pointer items-center gap-2 border-t border-border-subtle px-3 py-2 type-dense text-foreground-secondary',
                active === results.length && 'bg-accent text-foreground',
              )}
            >
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1 truncate">
                Ver todos os resultados para «{value.trim()}»
              </span>
              <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

function SuggestionOption({
  id,
  customer,
  query,
  fuzzy,
  active,
  onHover,
  onSelect,
}: {
  id: string;
  customer: CustomerSuggestion;
  query: string;
  fuzzy: boolean;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  // Fuzzy results don't contain the typed text, so there is nothing to mark.
  const mark = (text: string) => (fuzzy ? text : <Highlight text={text} query={query} />);
  const nifDisplay = customer.nif ? formatNif(customer.nif) : '';
  // The NIF is displayed with spaces; match it as typed with or without them.
  const digits = query.replace(/\s/g, '');
  const nifMatches = !fuzzy && digits.length > 0 && !!customer.nif?.startsWith(digits);
  const contact =
    [customer.phone, customer.email].find((field) =>
      highlightParts(field ?? '', query).some((part) => part.match),
    ) ?? customer.phone;

  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      onMouseEnter={onHover}
      onClick={onSelect}
      className={cn('flex cursor-pointer items-center gap-3 px-3 py-2', active && 'bg-accent')}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate type-dense font-medium text-foreground">{mark(customer.name)}</div>
        <div className="flex min-w-0 items-center gap-1.5 type-caption text-muted-foreground">
          {customer.company && (
            <span className="max-w-[45%] shrink-0 truncate">{mark(customer.company)}</span>
          )}
          {nifDisplay && (
            <>
              {customer.company && <span aria-hidden>·</span>}
              <span className="shrink-0 font-mono">
                {nifMatches ? (
                  <mark className="rounded-xs bg-highlight text-foreground">{nifDisplay}</mark>
                ) : (
                  nifDisplay
                )}
              </span>
            </>
          )}
          {contact && (
            <>
              <span aria-hidden>·</span>
              <span className="min-w-0 flex-1 truncate">{mark(contact)}</span>
            </>
          )}
        </div>
      </div>
      {customer.status !== 'active' && (
        <StatusBadge tone={getStatusTone(customer.status)}>
          {getStatusLabel(customer.status)}
        </StatusBadge>
      )}
    </li>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightParts(text, query).map((part, i) =>
        part.match ? (
          <mark key={i} className="rounded-xs bg-highlight text-foreground">
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </>
  );
}
