'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useORPC } from '@/context/orpc-context';
import type { Option } from '@/types';
import { useDebouncedValue } from '@mantine/hooks';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table';
import { Loader2Icon } from 'lucide-react';

import {
  customerProductStatusEnum,
  type CustomerProduct,
  type CustomerProductStatus,
} from '@repo/db/model';

import type { Inputs, Outputs } from '@/lib/orpc';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ErrorPageLoad } from '@/components/shared/error-page-load';
import { DataTable } from '@/components/table/data-table';
import { DataTableFacetedFilter } from '@/components/table/data-table-faceted-filter';
import InputSearch from '@/components/table/input-search';

const columnHelper =
  createColumnHelper<
    Outputs['masterData']['customerProduct']['getAll']['data'][number]
  >();

const columns = [
  columnHelper.accessor('product.name', {
    header: () => 'Product',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('customer.name', {
    header: () => 'Customer',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('status', {
    header: () => 'Status',
    cell: (info) => {
      const value = info.getValue();

      return (
        <Badge variant={value === 'SUCCESS' ? 'success' : 'outline'}>
          {value}
        </Badge>
      );
    },
  }),
];

const searchByOptions = [
  { value: 'customerName', label: 'Customer' },
] satisfies Option<keyof (CustomerProduct & { customerName: string })>[];

const statusOptions: Option<CustomerProductStatus>[] =
  customerProductStatusEnum.enumValues.map((status) => ({
    value: status,
    label: status.replace(/_/g, ' '),
  }));

export default function Page() {
  const { id: productId } = useParams<{ id: string }>();
  const orpc = useORPC();

  const productQuery = useQuery(
    orpc.masterData.product.getById.queryOptions({
      input: { id: productId },
    })
  );

  const [searchBy, setSearchBy] = useState(searchByOptions[0]?.value!);
  const [searchKey, setSearchKey] = useState('');
  const [searchKeyDebounce] = useDebouncedValue(searchKey, 500);
  const [statusKeys, setStatusKeys] = useState<CustomerProductStatus[]>([]);
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

  const query: Inputs['masterData']['customerProduct']['getAll'] = {
    page: pageIndex + 1,
    limit: pageSize,
    [searchBy]: searchKeyDebounce || undefined,
    status: statusKeys,
  };

  const customersQuery = useQuery(
    orpc.masterData.customerProduct.getAll.queryOptions({
      placeholderData: keepPreviousData,
      input: { ...query, productId },
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

  if (productQuery.isPending) {
    return <Loader2Icon className='animate-spin' />;
  }

  if (productQuery.isError) {
    return <ErrorPageLoad />;
  }

  return (
    <>
      <Breadcrumb className='pb-2 pt-4'>
        <BreadcrumbList>
          <BreadcrumbItem>Master Data</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbLink asChild>
            <Link href='/master-data/customer'>Customers</Link>
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Product</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center justify-between gap-4'>
        <h2 className='text-3xl'>
          Product:{' '}
          <span className='font-bold'>{productQuery.data?.data.name}</span>
        </h2>
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
          title='Status'
          values={statusKeys}
          setValues={setStatusKeys}
          options={statusOptions}
        />

        {/* <ColumnVisibilityDropdown tableInstance={table} /> */}
      </div>
      <DataTable tableInstance={table} isPending={customersQuery.isFetching} />
    </>
  );
}
