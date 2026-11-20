import * as React from 'react';
import {
  flexRender,
  type Row,
  type RowData,
  type Table as TanstackTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/shared/Pagination';
import { TableCard } from '@/components/shared/TableCard';
import { cn } from '@/lib/utils';

declare module '@tanstack/react-table' {
  // Type parameters must match TanStack's declaration to merge.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Classes for both the column's `th` and its `td`s (e.g. `text-right`). */
    className?: string;
  }
}

/**
 * A client-side TanStack table in a list-page `TableCard`: Ivory header row,
 * 24px edge inset, an empty state in place of the rows, and numbered
 * pagination in the card footer once there is more than one page. With
 * `pageSizeOptions` the footer (and its "Linhas por página" selector) shows
 * whenever there are rows; changing the size goes back to the first page and
 * is reported through `onPageSizeChange`.
 */
export function ClientTable<T>({
  table,
  empty,
  rowClassName,
  onRowClick,
  pageSizeOptions,
  onPageSizeChange,
  tableClassName,
  className,
}: {
  table: TanstackTable<T>;
  empty: React.ReactNode;
  rowClassName?: (row: Row<T>) => string | undefined;
  onRowClick?: (row: Row<T>) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  /** Extra classes on the `<table>` (e.g. a `min-w-*` for wide tables). */
  tableClassName?: string;
  className?: string;
}) {
  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;
  const showFooter = total > pageSize || (pageSizeOptions && total > 0);

  return (
    <TableCard
      ivoryHead
      className={className}
      footer={
        showFooter ? (
          <Pagination
            offset={pageIndex * pageSize}
            pageSize={pageSize}
            total={total}
            onChange={(offset) => table.setPageIndex(offset / pageSize)}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={
              pageSizeOptions &&
              ((size) => {
                table.setPagination({ pageIndex: 0, pageSize: size });
                onPageSizeChange?.(size);
              })
            }
          />
        ) : undefined
      }
    >
      {rows.length === 0 ? (
        empty
      ) : (
        <Table inset className={tableClassName}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.columnDef.meta?.className}
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                          ? 'descending'
                          : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(onRowClick && 'cursor-pointer', rowClassName?.(row))}
                onClick={onRowClick && (() => onRowClick(row))}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableCard>
  );
}
