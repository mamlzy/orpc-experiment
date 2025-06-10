import { useMemo, useState } from 'react';
import { useORPC } from '@/context/orpc-context';
import type { Option } from '@/types';
import { useDebouncedValue } from '@mantine/hooks';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getCoreRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table';

import { DataTable } from '@/components/table/data-table';
import InputSearch from '@/components/table/input-search';

import { columns } from './customer-table-columns';

const searchByOptions = [
  { value: 'name', label: 'Name' },
] satisfies Option<string>[];

interface CustomerTableProps {
  country: string | null;
}

export function CustomerTable({ country }: CustomerTableProps) {
  const orpc = useORPC();

  const [searchBy, setSearchBy] = useState(searchByOptions[0]?.value!);
  const [searchKey, setSearchKey] = useState('');
  const [searchKeyDebounce] = useDebouncedValue(searchKey, 500);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const query = {
    page: pageIndex + 1,
    limit: pageSize,
    [searchBy]: searchKeyDebounce || undefined,
    country,
  };

  const customersQuery = useQuery(
    orpc.masterData.customer.getAll.queryOptions({
      placeholderData: keepPreviousData,
      input: query,
    })
  );

  const defaultData = useMemo(() => [], []);

  const table = useReactTable({
    data: customersQuery.data?.data ?? defaultData,
    columns,
    pageCount: customersQuery.data?.pagination?.pageCount ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    columnResizeMode: 'onChange',
    renderFallbackValue: '-',
    meta: {},
  });

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <InputSearch
          searchBy={searchBy}
          searchKey={searchKey}
          options={searchByOptions}
          onSelectChange={setSearchBy}
          onInputChange={(e) => {
            setSearchKey(e.target.value);
            setPagination((current) => ({
              ...current,
              pageIndex: 0,
            }));
          }}
        />
      </div>

      <div>
        <DataTable
          tableInstance={table}
          tableClassName='max-w-[calc(100%-6rem)] sm:max-w-[calc(48rem-3.95rem)]'
        />
      </div>
    </div>
  );
}
