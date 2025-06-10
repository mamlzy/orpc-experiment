'use client';

import * as React from 'react';
import {
  flexRender,
  type Row,
  type Table as TTable,
} from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { TableLinearLoader } from './table-linear-loader';

type DataTableProps<TData> = {
  tableInstance: TTable<TData>;
  tableClassName?: string;
  onClickRow?: (row: Row<TData>) => void;
  isRowSelected?: (row: Row<TData>) => boolean;
  isPending?: boolean;
};

export function DataTable<TData>({
  tableInstance: table,
  onClickRow,
  isRowSelected,
  tableClassName,
  isPending,
}: DataTableProps<TData>) {
  return (
    <div className='relative w-full'>
      <TableLinearLoader show={isPending} />

      <div className={cn('rounded-md border', tableClassName)}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const width = header.column.columnDef.meta?.width || 'auto'; // Get the width from column meta
                  return (
                    <TableHead
                      key={header.id}
                      className='text-muted-foreground px-2.5 font-medium'
                      style={{ width }} // Apply the width dynamically
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onClickRow?.(row)}
                  className={cn(isRowSelected?.(row) && 'bg-muted')}
                >
                  {row.getVisibleCells().map((cell) => {
                    const width = cell.column.columnDef.meta?.width || 'auto'; // Get the width from column meta

                    return (
                      <TableCell
                        key={cell.id}
                        {...(cell.column.columnDef.meta?.getCellContext?.(
                          cell.getContext()
                        ) || {})}
                        className={cn(
                          'p-2.5',
                          cell.column.columnDef.meta?.getCellContext?.(
                            cell.getContext()
                          )?.className
                        )}
                        style={{ width }} // Apply the width dynamically
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length + 1}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-between space-x-2 py-4'>
        <div className='flex flex-wrap items-center gap-4'>
          <span className='flex items-center gap-1 text-sm'>
            Page&nbsp;
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <Select
            defaultValue='10'
            onValueChange={(newValue) => {
              table.setPageSize(Number(newValue));
            }}
          >
            <SelectTrigger className='h-8 w-max font-sans'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    Show {pageSize}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
