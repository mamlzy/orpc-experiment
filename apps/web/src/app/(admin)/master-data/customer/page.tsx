'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useORPC } from '@/context/orpc-context';
import type { Option } from '@/types';
import { useDebouncedValue } from '@mantine/hooks';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import {
  getCoreRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table';
import { PlusIcon } from 'lucide-react';

import {
  customerStatusEnum,
  customerTypeEnum,
  type Customer,
  type CustomerStatusEnum,
  type CustomerTypeEnum,
} from '@repo/db/model';

import type { Inputs } from '@/lib/orpc';
import { getNextPageParamFn } from '@/lib/react-query';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/table/data-table';
import { DataTableFacetedFilter } from '@/components/table/data-table-faceted-filter';
import { DataTableFacetedFilterPaginate } from '@/components/table/data-table-faceted-filter-paginate';
import InputSearch from '@/components/table/input-search';

import { columns } from './columns';

const searchByOptions = [{ value: 'name', label: 'Name' }] satisfies Option<
  keyof Customer
>[];

const statusOptions: Option<CustomerStatusEnum>[] =
  customerStatusEnum.enumValues.map((status) => ({
    value: status,
    label: status.replace(/_/g, ' '),
  }));

const customerTypeOptions: Option<CustomerTypeEnum>[] =
  customerTypeEnum.enumValues.map((customerType) => ({
    value: customerType,
    label: customerType.replace(/_/g, ' '),
  }));

export default function Page() {
  const orpc = useORPC();

  const [searchBy, setSearchBy] = useState(searchByOptions[0]?.value!);
  const [searchKey, setSearchKey] = useState('');
  const [searchKeyDebounce] = useDebouncedValue(searchKey, 500);
  const [statusKeys, setStatusKeys] = useState<CustomerStatusEnum[]>([]);
  const [customerTypeKeys, setCustomerTypeKeys] = useState<CustomerTypeEnum[]>(
    []
  );
  const [productKeys, setProductKeys] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productSearchDebounce] = useDebouncedValue(productSearch, 300);
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

  const query: Inputs['masterData']['customer']['getAll'] = {
    page: pageIndex + 1,
    limit: pageSize,
    [searchBy]: searchKeyDebounce || undefined,
    status: statusKeys,
    customerType: customerTypeKeys,
    productIds: productKeys,
  };

  const customersQuery = useQuery(
    orpc.masterData.customer.getAll.queryOptions({
      placeholderData: keepPreviousData,
      input: query,
    })
  );

  const productsQuery = useInfiniteQuery(
    orpc.masterData.product.getAll.infiniteOptions({
      initialPageParam: 1,
      getNextPageParam: getNextPageParamFn,
      input: (pageParam) => ({
        page: pageParam,
        limit: 10,
        name: productSearchDebounce,
      }),
    })
  );

  const defaultData = useMemo(() => [], []);

  const table = useReactTable({
    columns,
    data: customersQuery.data?.data ?? defaultData,
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
    <>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-4 pt-4'>
        <h2 className='text-3xl font-bold'>Customers</h2>

        <div>
          <Link
            href='/master-data/customer/create'
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <PlusIcon className='size-4' /> <span>New Customer</span>
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

        <DataTableFacetedFilter
          title='Type'
          values={customerTypeKeys}
          setValues={setCustomerTypeKeys}
          options={customerTypeOptions}
        />

        <DataTableFacetedFilter
          title='Status'
          values={statusKeys}
          setValues={setStatusKeys}
          options={statusOptions}
        />

        <DataTableFacetedFilterPaginate
          title='Product'
          values={productKeys}
          setValues={setProductKeys}
          query={productsQuery}
          search={productSearch}
          setSearch={setProductSearch}
          optionValue='id'
          optionLabel='name'
        />
      </div>

      <DataTable tableInstance={table} isPending={customersQuery.isFetching} />
    </>
  );
}
