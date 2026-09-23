import * as React from 'react';
import { flexRender, type Row, type Table as TanstackTable } from '@tanstack/react-table';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/shared/Pagination';
import { cn } from '@/lib/utils';

/**
 * A client-side TanStack table in the dashboard style: flush table in a
 * panel, an empty state in place of the rows, and offset pagination below
 * once there is more than one page.
 */
export function ClientTable<T>({
  table,
  empty,
  rowClassName,
  onRowClick,
}: {
  table: TanstackTable<T>;
  empty: React.ReactNode;
  rowClassName?: (row: Row<T>) => string | undefined;
  onRowClick?: (row: Row<T>) => void;
}) {
  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <>
      <Card className="py-0">
        {rows.length === 0 ? (
          empty
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {total > pageSize && (
        <Pagination
          offset={pageIndex * pageSize}
          pageSize={pageSize}
          total={total}
          onChange={(offset) => table.setPageIndex(offset / pageSize)}
        />
      )}
    </>
  );
}
