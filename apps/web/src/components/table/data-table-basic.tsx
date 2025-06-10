'use client';

import { flexRender, type Row, type Table } from '@tanstack/react-table';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table as ShadTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Skeleton } from '../ui/skeleton';

type DataTableBasicProps<T extends object> = {
  tableInstance: Table<T>;
  toggleVisibility?: boolean;
  id?: string;
  isPending?: boolean;
  withPagination?: boolean;
  paginationPosition?: 'top' | 'bottom';
  skeletonCount?: number;
  containerClassName?: string;
  tableWrapperClassName?: string;
  rowOnClick?: (row: Row<T>) => void;
};

export const DataTableBasic = <T extends object>({
  tableInstance: table,
  toggleVisibility,
  id,
  isPending,
  withPagination = true,
  paginationPosition = 'bottom',
  skeletonCount = 4,
  containerClassName,
  tableWrapperClassName,
  rowOnClick,
}: DataTableBasicProps<T>) => {
  return (
    <div className={cn('grid w-full gap-3', containerClassName)} id={id}>
      {withPagination && paginationPosition === 'top' && (
        <Pagination table={table} className='pt-0' />
      )}
      {toggleVisibility && (
        <div className='flex items-center py-4'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='ml-auto'>
                Columns <ChevronDownIcon className='ml-2 size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <div
        className={cn(
          'overflow-x-auto rounded-md border',
          tableWrapperClassName
        )}
      >
        <ShadTable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
            {isPending ? (
              //! Loading Skeletons
              [...Array(skeletonCount)].map((_each, idx) => (
                <TableRow key={idx}>
                  {table.getAllColumns().map((each, index) => (
                    <TableCell key={`${index}${Math.random()}`}>
                      <Skeleton className='h-6 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={() => rowOnClick?.(row)}
                    className={cn(rowOnClick && 'cursor-pointer')}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const hasMeta =
                        cell.getContext().cell.column.columnDef.meta;
                      const { size: width } = cell.column.columnDef;
                      return (
                        <TableCell
                          key={cell.id}
                          style={{ width }}
                          {...(hasMeta?.getCellContext
                            ? {
                                ...hasMeta.getCellContext(cell.getContext()),
                              }
                            : {})}
                          className={cn(
                            cell.column.columnDef.meta?.getCellContext?.(
                              cell.getContext()
                            )?.className
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length + 1}
                  className='h-12 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </ShadTable>
      </div>
      {withPagination && paginationPosition === 'bottom' && (
        <Pagination table={table} />
      )}
    </div>
  );
};

function Pagination({
  table,
  className,
}: {
  table: DataTableBasicProps<any>['tableInstance'];
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-end space-x-2', className)}>
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
  );
}
