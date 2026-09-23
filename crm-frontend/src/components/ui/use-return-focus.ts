import * as React from 'react';

type FocusEventHandler = (event: Event) => void;

/** Modal layer roots (marked by the content components; callers may override
 *  `data-slot`, so a dedicated attribute is used) — focus moving inside these
 *  never counts as an "opener". */
const LAYER_SELECTOR = '[data-focus-layer]';

let lastFocusOutsideLayers: HTMLElement | null = null;
let listening = false;

function ensureListener() {
  if (listening || typeof document === 'undefined') return;
  listening = true;
  document.addEventListener(
    'focusin',
    (event) => {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest(LAYER_SELECTOR)) {
        lastFocusOutsideLayers = target;
      }
    },
    true,
  );
}

/**
 * Radix modal layers return focus to their `Trigger`; when a layer is opened
 * from a plain button (controlled `open` state, no `DialogTrigger`) there is
 * no trigger and focus falls to <body>.
 *
 * This tracks the last element focused *outside* any modal layer (the button
 * that opened it, in practice) and restores it on close. A caller's
 * `onCloseAutoFocus` still wins when it prevents the default.
 */
export function useReturnFocus(onCloseAutoFocus?: FocusEventHandler) {
  React.useEffect(ensureListener, []);

  const handleClose = React.useCallback(
    (event: Event) => {
      onCloseAutoFocus?.(event);
      if (event.defaultPrevented) return;
      const opener = lastFocusOutsideLayers;
      if (opener && opener.isConnected && opener !== document.body) {
        event.preventDefault();
        opener.focus();
      }
    },
    [onCloseAutoFocus],
  );

  return { onCloseAutoFocus: handleClose };
}
