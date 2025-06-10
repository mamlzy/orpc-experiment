import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import type { Option } from '@/types';
import { useDebouncedValue } from '@mantine/hooks';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import {
  EllipsisVerticalIcon,
  PackageIcon,
  PencilIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import type { CustomerProduct, Product } from '@repo/db/model';

import { orpc, type Outputs } from '@/lib/orpc';
import { getNextPageParamFn } from '@/lib/react-query';
import { cn } from '@/lib/utils';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { MultipleSelector } from '@/components/ui/multiple-selector';

function ProductCell({
  products,
  isExpanded,
  setIsExpanded,
}: {
  products: (CustomerProduct & { product: Product })[];
  isExpanded: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className={cn('relative flex flex-col items-start gap-1 px-2.5')}>
      <div
        className={`flex w-full flex-col items-start gap-1 ${!isExpanded ? 'max-h-[94px]' : ''} overflow-hidden`}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/master-data/customer-product/${product.productId}`}
            className='decoration-primary underline-offset-3 w-full text-start underline transition-colors hover:decoration-2'
          >
            {product.product?.name}
          </Link>
        ))}
      </div>
      {products.length > 3 && (
        <>
          {!isExpanded && (
            <div className='pointer-events-none absolute -bottom-2.5 left-0 right-0 h-20 bg-gradient-to-b from-transparent from-0% to-white dark:from-transparent dark:from-40% dark:via-black/80 dark:to-black' />
          )}
          <div
            className={cn(
              'mx-auto flex justify-center',
              !isExpanded && 'absolute -bottom-1 left-0 right-0'
            )}
          >
            <button
              type='button'
              onClick={() => setIsExpanded(!isExpanded)}
              className='bg-input hover:bg-input/80 rounded-md px-2 py-1 text-xs'
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

type CustomerOutput =
  Outputs['masterData']['customer']['getAll']['data'][number];

const columnHelper = createColumnHelper<CustomerOutput>();

export const columns = [
  columnHelper.display({
    id: 'no',
    header: () => 'No',
    meta: {
      getCellContext: () => ({ className: 'align-top' }),
    },
    cell: (info) =>
      info.row.index +
      1 +
      info.table.getState().pagination.pageIndex *
        info.table.getState().pagination.pageSize,
  }),
  columnHelper.accessor('businessEntity', {
    header: () => 'Business Entity',
    meta: {
      getCellContext: () => ({ className: 'align-top' }),
    },
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: () => 'Name',
    meta: {
      getCellContext: () => ({ className: 'align-top' }),
    },
    cell: (info) => info.getValue(),
  }),
  //! customerProducts not used right now
  // columnHelper.accessor('customerProducts', {
  //   header: () => 'Products',
  //   meta: {
  //     getCellContext: () => ({ className: 'px-0 align-top' }),
  //   },
  //   cell: (info) => {
  //     const [isExpanded, setIsExpanded] = useState(false);

  //     const products = info.getValue();

  //     return (
  //       <ProductCell
  //         products={products}
  //         isExpanded={isExpanded}
  //         setIsExpanded={setIsExpanded}
  //       />
  //     );
  //   },
  // }),
  columnHelper.accessor('successCustomerProducts', {
    header: () => 'Success Products',
    meta: {
      getCellContext: () => ({ className: 'px-0 align-top' }),
    },
    cell: (info) => {
      const [isExpanded, setIsExpanded] = useState(false);

      const products = info.getValue();

      return (
        <ProductCell
          products={products}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      );
    },
  }),
  columnHelper.accessor('deepeningCustomerProducts', {
    header: () => 'Deepening Products',
    meta: {
      getCellContext: () => ({ className: 'px-0 align-top' }),
    },
    cell: (info) => {
      const [isExpanded, setIsExpanded] = useState(false);

      const products = info.getValue();

      return (
        <ProductCell
          products={products}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      );
    },
  }),
  columnHelper.accessor('country', {
    header: () => 'Country',
    meta: {
      getCellContext: () => ({ className: 'align-top' }),
    },
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('status', {
    header: () => 'Status',
    meta: {
      getCellContext: () => ({ className: 'align-top' }),
    },
    cell: (info) => {
      const value = info.getValue();

      return (
        <Badge
          variant={
            value === 'ACTIVE'
              ? 'success'
              : value === 'INACTIVE'
                ? 'destructive'
                : 'outline'
          }
        >
          {value}
        </Badge>
      );
    },
  }),
  columnHelper.accessor('customerType', {
    header: () => 'Type',
    meta: {
      getCellContext: () => ({ className: 'align-top' }),
    },
    cell: (info) => {
      const value = info.getValue();

      return (
        <Badge variant='outline'>
          {value === 'DOMESTIC' ? '🇮🇩' : '🌏'} {value}
        </Badge>
      );
    },
  }),
  columnHelper.accessor('description', {
    header: () => 'Description',
    meta: {
      getCellContext: () => ({ className: 'align-top' }),
    },
    cell: (info) => <div className='whitespace-normal'>{info.getValue()}</div>,
  }),
  columnHelper.display({
    id: 'actions',
    meta: {
      width: '0%',

      getCellContext: (context) => {
        const products = context.row.original.customerProducts;

        return {
          className: products.length > 3 && 'align-top',
        };
      },
    },
    cell: (info) => {
      const qc = useQueryClient();

      const [showConfirmationDialog, setshowConfirmationDialog] =
        useState(false);
      const [selectedCustomer, setSelectedCustomer] =
        useState<CustomerOutput | null>(null);

      const customer = info.row.original;

      const deleteCustomerMutation = useMutation(
        orpc.masterData.customer.deleteById.mutationOptions()
      );

      const handleDelete = () => {
        toast.promise(deleteCustomerMutation.mutateAsync({ id: customer.id }), {
          loading: 'Deleting...',
          success: async () => {
            await qc.invalidateQueries({
              queryKey: orpc.masterData.customer.key(),
            });

            return `Customer deleted.`;
          },
          error: (err) => {
            console.log('err =>', err);

            return 'Failed to delete customer';
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
              <DropdownMenuItem asChild>
                <Link href={`/master-data/customer/${customer.id}`}>
                  <PencilIcon className='mr-2' />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCustomer(customer)}>
                <PackageIcon className='mr-2' />
                Manage Products
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/master-data/customer/manage-pic/${customer.id}`}>
                  <UserIcon className='mr-2' />
                  Manage Pic
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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

          <SettingProductsDialog
            customer={selectedCustomer}
            setCustomer={setSelectedCustomer}
          />
        </>
      );
    },
  }),
];

function SettingProductsDialog({
  customer,
  setCustomer,
}: {
  customer: CustomerOutput | null;
  setCustomer: Dispatch<SetStateAction<CustomerOutput | null>>;
}) {
  const qc = useQueryClient();

  const [deepeningProducts, setDeepeningProducts] = useState<Option[]>([]);
  const [successProducts, setSuccessProducts] = useState<Option[]>([]);

  useEffect(() => {
    if (customer) {
      setDeepeningProducts(
        customer.deepeningCustomerProducts?.map((p) => ({
          value: p.product.id,
          label: p.product.name,
        })) || []
      );

      setSuccessProducts(
        customer.successCustomerProducts?.map((p) => ({
          value: p.product.id,
          label: p.product.name,
        })) || []
      );
    }
  }, [customer]);

  const [deepeningProductSearch, setDeepeningProductSearch] = useState('');
  const [deepeningProductSearchDebounce] = useDebouncedValue(
    deepeningProductSearch,
    300
  );

  const deepeningProductsQuery = useInfiniteQuery(
    orpc.masterData.product.getAll.infiniteOptions({
      initialPageParam: 1,
      getNextPageParam: getNextPageParamFn,
      input: (pageParam) => ({
        page: pageParam,
        name: deepeningProductSearchDebounce,
      }),
    })
  );

  const [successProductSearch, setSuccessProductSearch] = useState('');
  const [successProductSearchDebounce] = useDebouncedValue(
    successProductSearch,
    300
  );

  const successProductsQuery = useInfiniteQuery(
    orpc.masterData.product.getAll.infiniteOptions({
      initialPageParam: 1,
      getNextPageParam: getNextPageParamFn,
      input: (pageParam) => ({
        page: pageParam,
        name: successProductSearchDebounce,
      }),
    })
  );

  const manageProductsMutation = useMutation(
    orpc.masterData.customerProduct.manage.mutationOptions()
  );

  const handleSave = () => {
    if (!customer) return;

    manageProductsMutation.mutate(
      {
        customerId: customer.id,
        deepeningProductIds: deepeningProducts.map((p) => p.value),
        successProductIds: successProducts.map((p) => p.value),
      },
      {
        onSuccess: async () => {
          // close the dialog
          setCustomer(null);

          await qc.invalidateQueries({
            queryKey: orpc.masterData.customer.key(),
          });

          toast.success('Products managed successfully');
        },
        onError: (err) => {
          console.log('err =>', err);

          toast.error('Failed to manage products');
        },
      }
    );
  };

  return (
    <Dialog open={!!customer} onOpenChange={() => setCustomer(null)}>
      <DialogContent
        className='sm:max-w-lg'
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Manage Products</DialogTitle>
          <DialogDescription className='sr-only' />
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label className='flex items-center gap-1'>
              Success Products
              <div className='h-2 w-2 rounded-full bg-green-400 dark:bg-green-500' />
            </Label>
            <MultipleSelector
              query={successProductsQuery}
              filterValues={deepeningProducts.map((p) => p.value)}
              optionValue='id'
              optionLabel='name'
              value={successProducts}
              onChange={(newOptions) => {
                setSuccessProducts(newOptions);
                setSuccessProductSearch('');
              }}
              inputProps={{
                onValueChange: (value) => {
                  setSuccessProductSearch(value);
                },
              }}
              placeholder='Select success products...'
            />
          </div>

          <div className='grid gap-2'>
            <Label className='flex items-center gap-2'>
              Deepening Products
              <div className='h-2 w-2 rounded-full bg-yellow-400 dark:bg-yellow-500' />
            </Label>
            <MultipleSelector
              query={deepeningProductsQuery}
              filterValues={successProducts.map((p) => p.value)}
              optionValue='id'
              optionLabel='name'
              value={deepeningProducts}
              onChange={(newOptions) => {
                setDeepeningProducts(newOptions);
                setDeepeningProductSearch('');
              }}
              inputProps={{
                onValueChange: (value) => {
                  setDeepeningProductSearch(value);
                },
              }}
              placeholder='Select deepening products...'
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            onClick={handleSave}
            disabled={manageProductsMutation.isPending}
          >
            {manageProductsMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
