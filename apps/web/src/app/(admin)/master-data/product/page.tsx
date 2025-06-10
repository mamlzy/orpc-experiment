'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useORPC } from '@/context/orpc-context';
import type { Option } from '@/types';
import { useDebouncedValue } from '@mantine/hooks';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getCoreRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table';
import { PlusIcon } from 'lucide-react';

import type { Inputs } from '@/lib/orpc';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/table/data-table';
import InputSearch from '@/components/table/input-search';

import { columns } from './columns';

const searchByOptions = [{ value: 'name', label: 'Name' }] satisfies Option<
  keyof NonNullable<Inputs['masterData']['product']['getAll']>
>[];

export default function Page() {
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

  const query: Inputs['masterData']['product']['getAll'] = {
    page: pageIndex + 1,
    limit: pageSize,
    [searchBy]: searchKeyDebounce || undefined,
  };

  const productsQuery = useQuery(
    orpc.masterData.product.getAll.queryOptions({
      placeholderData: keepPreviousData,
      input: { ...query },
    })
  );

  const defaultData = useMemo(() => [], []);

  const table = useReactTable({
    data: productsQuery.data?.data ?? defaultData,
    columns,
    pageCount: productsQuery.data?.pagination?.pageCount ?? -1,
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
    <>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-4 pt-4'>
        <h2 className='text-3xl font-bold'>Products</h2>

        <div>
          <Link
            href='/master-data/product/create'
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <PlusIcon className='size-4' /> <span>New Product</span>
          </Link>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <InputSearch
          searchBy={searchBy}
          searchKey={searchKey}
          options={searchByOptions}
          onSelectChange={setSearchBy}
          onInputChange={(e) => {
            setSearchKey(e.target.value); //! set searchKey (debounce)
            //! reset pageIndex to "0"
            setPagination((current) => ({
              ...current,
              pageIndex: 0,
            }));
          }}
        />

        {/* <ColumnVisibilityDropdown tableInstance={table} /> */}
      </div>
      <DataTable tableInstance={table} isPending={productsQuery.isFetching} />
    </>
  );
}
