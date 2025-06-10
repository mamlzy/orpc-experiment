import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebouncedValue } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { orpc } from '@/lib/orpc';
import { getNextPageParamFn } from '@/lib/react-query';
import { formatIDRCurrency } from '@/lib/utils';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Form } from '@/components/ui/form';
import { InputComboboxPaginate } from '@/components/inputs/rhf/input-combobox-paginate';
import InputNumber from '@/components/inputs/rhf/input-number';

import { createItemSchema, type CreateItemSchema } from './shared';

type TableMeta = {
  items: CreateItemSchema[];
  setItems: Dispatch<SetStateAction<CreateItemSchema[]>>;
};

const columnHelper = createColumnHelper<CreateItemSchema>();

export const columnsDef = [
  columnHelper.display({
    id: 'no',
    header: () => 'No',
    meta: {
      getCellContext: () => ({ className: '!w-px' }),
    },
    cell: (info) =>
      info.row.index +
      1 +
      info.table.getState().pagination.pageIndex *
        info.table.getState().pagination.pageSize,
  }),
  columnHelper.accessor('productName', {
    header: 'Product Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('qty', {
    header: 'Qty',
    meta: {
      getCellContext: () => ({ className: '!w-px' }),
    },
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('price', {
    header: 'Price',
    meta: {
      getCellContext: () => ({ className: '!w-px' }),
    },
    cell: (info) => formatIDRCurrency(info.getValue()),
  }),
  columnHelper.display({
    id: 'actions',
    meta: {
      getCellContext: () => ({ className: '!w-px' }),
    },
    cell: (info) => {
      const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
        null
      );

      const { items, setItems } = info.table.options.meta as TableMeta;

      const handleEdit = () => {
        setSelectedItemIndex(info.row.index);
      };

      const handleDelete = () => {
        setItems((prev) => {
          const newItems = [...prev];
          newItems.splice(info.row.index, 1);

          return newItems;
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
              <DropdownMenuItem onClick={handleEdit}>
                <PencilIcon className='mr-2' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete}>
                <Trash2Icon className='mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <EditDialog
            items={items}
            setItems={setItems}
            selectedItemIndex={selectedItemIndex}
            setSelectedItemIndex={setSelectedItemIndex}
          />
        </>
      );
    },
  }),
];

function EditDialog({
  items,
  setItems,
  selectedItemIndex,
  setSelectedItemIndex,
}: {
  items: CreateItemSchema[];
  setItems: Dispatch<SetStateAction<CreateItemSchema[]>>;
  selectedItemIndex: number | null;
  setSelectedItemIndex: Dispatch<SetStateAction<number | null>>;
}) {
  useEffect(() => {
    if (selectedItemIndex === null) return;

    const item = items[selectedItemIndex];

    itemForm.reset(item);
  }, [selectedItemIndex]);

  const itemForm = useForm({
    mode: 'all',
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      productId: '',
      productName: '',
      qty: 0,
      price: 0,
    },
  });

  const [productSearch, setProductSearch] = useState('');
  const [productSearchDebounce] = useDebouncedValue(productSearch, 300);

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

  // Get disabled product IDs (exclude the currently editing item)
  const disabledProductIds = useMemo(() => {
    if (selectedItemIndex === null) return [];

    return items
      .filter((_, index) => index !== selectedItemIndex)
      .map((item) => item.productId);
  }, [items, selectedItemIndex]);

  const handleUpdateItem: SubmitHandler<CreateItemSchema> = (updatedItem) => {
    if (selectedItemIndex === null) return;

    setItems((prev) => {
      const newItems = [...prev];
      newItems[selectedItemIndex] = updatedItem;

      return newItems;
    });

    setSelectedItemIndex(null);
  };

  return (
    <Dialog
      open={selectedItemIndex !== null}
      onOpenChange={(bool) => {
        if (!bool) {
          setSelectedItemIndex(null);
        }
      }}
    >
      <DialogContent className='sm:max-w-[425px]'>
        <Form {...itemForm}>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription className='sr-only'>Edit Item</DialogDescription>
          </DialogHeader>
          <InputComboboxPaginate
            control={itemForm.control}
            name='productId'
            label='Product'
            optionValue='id'
            optionLabel='name'
            query={productsQuery}
            search={productSearch}
            getSingleQueryOptions={orpc.masterData.product.getById.queryOptions}
            additionalOnChange={(product) => {
              itemForm.setValue('productName', product.name);
            }}
            additionalOnClear={() => {
              itemForm.setValue('productName', '');
            }}
            setSearch={setProductSearch}
            mandatory
            disabledOptions={disabledProductIds}
          />

          <div className='grid grid-cols-2 items-start gap-4'>
            <InputNumber
              control={itemForm.control}
              name='qty'
              label='Quantity'
              mandatory
            />
            <InputNumber
              control={itemForm.control}
              name='price'
              label='Price'
              mandatory
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              onClick={itemForm.handleSubmit(handleUpdateItem)}
            >
              Save changes
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
