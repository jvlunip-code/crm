import { useState } from 'react';

/**
 * State for a delete confirmation: which item, and whether the dialog is open.
 * The item is kept after closing so the dialog's text doesn't blank out during
 * its exit animation.
 */
export function useDeleteTarget<T>() {
  const [target, setTarget] = useState<T | null>(null);
  const [open, setOpen] = useState(false);

  return {
    target,
    open,
    setOpen,
    request: (item: T) => {
      setTarget(item);
      setOpen(true);
    },
  };
}
