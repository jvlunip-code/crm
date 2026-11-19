/**
 * Page size meaning "every row on one page". A large finite number rather than
 * Infinity, because TanStack computes `pageIndex * pageSize` (0 * Infinity is NaN).
 */
export const PAGE_SIZE_ALL = Number.MAX_SAFE_INTEGER;

export function pageSizeLabel(size: number): string {
  return size === PAGE_SIZE_ALL ? 'Todas' : String(size);
}

/** Reads a remembered page size, falling back when missing, invalid or storage is blocked. */
export function readStoredPageSize(key: string, options: number[], fallback: number): number {
  try {
    const stored = Number(window.localStorage.getItem(key));
    return options.includes(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

export function storePageSize(key: string, size: number): void {
  try {
    window.localStorage.setItem(key, String(size));
  } catch {
    // Storage blocked (private mode…): the choice just isn't remembered.
  }
}
