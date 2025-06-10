import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebouncedValue } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { orpc } from '@/lib/orpc';
import { getNextPageParamFn } from '@/lib/react-query';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { InputComboboxPaginate } from '@/components/inputs/rhf/input-combobox-paginate';
import InputNumber from '@/components/inputs/rhf/input-number';

import { ItemsTable } from './items-table';
import { createItemSchema, type CreateItemSchema } from './shared';

export function ItemsSection({
  items,
  setItems,
}: {
  items: CreateItemSchema[];
  setItems: Dispatch<SetStateAction<CreateItemSchema[]>>;
}) {
  const disabledProductIds = useMemo(
    () => items.map((item) => item.productId),
    [items]
  );

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

  const handleAddItem: SubmitHandler<CreateItemSchema> = (item) => {
    setItems((prev) => [...prev, item]);
    itemForm.reset();
  };

  return (
    <div className='bg-secondary rounded-md border p-4'>
      <Form {...itemForm}>
        <form
          onSubmit={itemForm.handleSubmit(handleAddItem)}
          className='mb-6 grid gap-4'
        >
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

          <div className='flex justify-center'>
            <Button variant='outline' type='submit'>
              Add Item
            </Button>
          </div>
        </form>
      </Form>
      <ItemsTable items={items} setItems={setItems} />
    </div>
  );
}
