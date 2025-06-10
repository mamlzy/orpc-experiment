'use client';

import { useMemo, useState } from 'react';
import { useORPC } from '@/context/orpc-context';
import { useQuery } from '@tanstack/react-query';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';

import type { CustomerTypeEnum } from '@repo/db/model';

import type { Outputs } from '@/lib/orpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableBasic } from '@/components/table/data-table-basic';

const columnHelper =
  createColumnHelper<
    Outputs['masterData']['dashboard']['totalCustomerBySector']['data'][number]
  >();

export const columnsDef = [
  columnHelper.accessor('sector', {
    header: 'Sector',
    cell: (info) => info.getValue() || 'Unknown Sector',
  }),
  columnHelper.accessor('total', {
    header: () => <div className='text-right'>Total</div>,
    cell: (info) => <div className='text-right'>{info.getValue()}</div>,
  }),
];

export function CustomerBySectorTable({
  customerType,
}: {
  customerType: CustomerTypeEnum;
}) {
  const orpc = useORPC();

  const columns = useMemo(() => columnsDef, []);
  const defaultData = useMemo(() => [], []);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { data, isPending } = useQuery(
    orpc.masterData.dashboard.totalCustomerBySector.queryOptions({
      input: { customerType },
    })
  );

  const table = useReactTable({
    columns,
    data: data?.data ?? defaultData,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <Card className='flex flex-col'>
      <CardHeader className='grid-rows-none border-b'>
        <CardTitle>Customer by Sector</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <DataTableBasic tableInstance={table} isPending={isPending} />
      </CardContent>
    </Card>
  );
}
