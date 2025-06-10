'use client';

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useParams } from 'next/navigation';
import { useORPC } from '@/context/orpc-context';
import type { Option } from '@/types';
import { useDebouncedValue } from '@mantine/hooks';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table';
import { EllipsisVerticalIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import type { GetCustomerPicsSchema } from '@repo/db/schema';

import { orpc, type Inputs } from '@/lib/orpc';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/table/data-table';
import InputSearch from '@/components/table/input-search';

import type { CustomerOutput } from '../types';

type TableMeta = {
  setSelectedEditPic: Dispatch<SetStateAction<CustomerOutput | null>>;
};

const columnHelper = createColumnHelper<CustomerOutput>();

export const columns = [
  columnHelper.display({
    id: 'no',
    header: () => 'No',
    cell: (info) =>
      info.row.index +
      1 +
      info.table.getState().pagination.pageIndex *
        info.table.getState().pagination.pageSize,
  }),
  columnHelper.accessor('picName', {
    header: () => 'Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('position', {
    header: () => 'Position',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: () => 'Email',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('phone', {
    header: () => 'Phone',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('address', {
    header: () => 'Address',
    cell: (info) => info.getValue(),
  }),
  columnHelper.display({
    id: 'actions',
    cell: (info) => {
      const qc = useQueryClient();

      const [showConfirmationDialog, setshowConfirmationDialog] =
        useState(false);

      const { id } = info.row.original;
      const { setSelectedEditPic } = info.table.options.meta as TableMeta;

      const deleteCustomerMutation = useMutation(
        orpc.masterData.customerPic.deleteById.mutationOptions()
      );

      const handleDelete = () => {
        toast.promise(deleteCustomerMutation.mutateAsync({ id }), {
          loading: 'Deleting...',
          success: async () => {
            await qc.invalidateQueries({
              queryKey: orpc.masterData.customerPic.key(),
            });

            setSelectedEditPic(null);

            return `Pic deleted.`;
          },
          error: (err) => {
            console.log('err =>', err);
            return `Error, ${err.message}`;
          },
        });
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='hover:bg-primary/10'
              >
                <EllipsisVerticalIcon
                  strokeWidth={2.5}
                  className='text-muted-foreground !size-5'
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              sideOffset={0}
              className='font-normal'
            >
              <DropdownMenuItem onClick={() => setshowConfirmationDialog(true)}>
                <Trash2Icon className='mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={showConfirmationDialog}
            onOpenChange={setshowConfirmationDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  }),
];
const searchByOptions = [{ value: 'picName', label: 'Name' }] satisfies Option<
  keyof GetCustomerPicsSchema
>[];

export function CustomerPicTable({
  selectedEditPic,
  setSelectedEditPic,
}: {
  selectedEditPic: CustomerOutput | null;
  setSelectedEditPic: Dispatch<SetStateAction<CustomerOutput | null>>;
}) {
  const params = useParams<{ id: string }>();
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

  const query: Inputs['masterData']['customerPic']['getAll'] = {
    page: pageIndex + 1,
    limit: pageSize,
    [searchBy]: searchKeyDebounce || undefined,
    customerId: params.id,
  };

  const customerPicsQuery = useQuery(
    orpc.masterData.customerPic.getAll.queryOptions({
      placeholderData: keepPreviousData,
      input: query,
    })
  );

  const defaultData = useMemo(() => [], []);

  const table = useReactTable({
    columns,
    data: customerPicsQuery.data?.data ?? defaultData,
    pageCount: customerPicsQuery.data?.pagination?.pageCount ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    columnResizeMode: 'onChange',
    renderFallbackValue: '-',
    meta: {
      setSelectedEditPic,
    },
  });

  return (
    <>
      <div className='mb-4 flex items-center gap-2'>
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
      </div>

      <DataTable
        tableInstance={table}
        onClickRow={(row) => {
          setSelectedEditPic(row.original);
        }}
        isRowSelected={(row) => selectedEditPic?.id === row.original.id}
      />
    </>
  );
}
