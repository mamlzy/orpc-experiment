import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';

import { DataTableBasic } from '@/components/table/data-table-basic';

import { columnsDef } from './items-table-columns';
import type { CreateItemSchema } from './shared';

export function ItemsTable({
  items,
  setItems,
}: {
  items: CreateItemSchema[];
  setItems: Dispatch<SetStateAction<CreateItemSchema[]>>;
}) {
  const columns = useMemo(() => columnsDef, []);
  const defaultData = useMemo(() => [], []);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    columns,
    data: items ?? defaultData,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
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
    meta: {
      items,
      setItems,
    },
  });

  return (
    <div>
      <DataTableBasic
        tableInstance={table}
        withPagination={false}
        containerClassName='bg-background'
      />
    </div>
  );
}
