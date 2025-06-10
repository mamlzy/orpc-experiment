'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useORPC } from '@/context/orpc-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebouncedValue } from '@mantine/hooks';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import {
  createTransactionSchema,
  type CreateTransactionSchema,
} from '@repo/db/schema';

import { getNextPageParamFn } from '@/lib/react-query';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { InputComboboxPaginate } from '@/components/inputs/rhf/input-combobox-paginate';

import { ItemsSection } from './_components/items-section';
import type { CreateItemSchema } from './_components/shared';

export default function Page() {
  const router = useRouter();
  const qc = useQueryClient();
  const orpc = useORPC();

  const form = useForm({
    mode: 'all',
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      marketingId: '',
      customerId: '',
      items: [],
    },
  });

  const [items, setItems] = useState<CreateItemSchema[]>([]);

  const [marketingSearch, setMarketingSearch] = useState('');
  const [marketingSearchDebounce] = useDebouncedValue(marketingSearch, 300);

  const marketingsQuery = useInfiniteQuery(
    orpc.masterData.user.getAll.infiniteOptions({
      initialPageParam: 1,
      getNextPageParam: getNextPageParamFn,
      input: (pageParam) => ({
        page: pageParam,
        limit: 10,
        name: marketingSearchDebounce,
      }),
    })
  );

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSearchDebounce] = useDebouncedValue(customerSearch, 300);

  const customersQuery = useInfiniteQuery(
    orpc.masterData.customer.getAll.infiniteOptions({
      initialPageParam: 1,
      getNextPageParam: getNextPageParamFn,
      input: (pageParam) => ({
        page: pageParam,
        limit: 10,
        name: customerSearchDebounce,
      }),
    })
  );

  const createTransactionMutation = useMutation(
    orpc.sales.transaction.create.mutationOptions()
  );

  const onSubmit: SubmitHandler<CreateTransactionSchema> = async (values) => {
    const formattedItems = items.map(
      ({ productName: _productName, ...item }) => item
    );

    createTransactionMutation.mutate(
      { ...values, items: formattedItems },
      {
        onSuccess: async () => {
          await qc.invalidateQueries({
            queryKey: orpc.sales.transaction.key(),
          });
          toast.success('Transaction created successfully');
          router.push('/sales/transaction');
        },
        onError: (error) => {
          console.error('error', error);

          toast.error(error.message);
        },
      }
    );
  };

  return (
    <div className='container'>
      <Breadcrumb className='my-4'>
        <BreadcrumbList className='sm:gap-2'>
          <BreadcrumbItem>
            <BreadcrumbPage className='text-muted-foreground'>
              Sales
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/sales/transaction'>Transactions</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='mb-6 flex justify-between gap-4'>
        <h2 className='text-3xl font-bold'>Create Transaction</h2>

        <Button
          type='submit'
          disabled={createTransactionMutation.isPending}
          onClick={form.handleSubmit(onSubmit)}
        >
          {createTransactionMutation.isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </div>

      <Form {...form}>
        <div className='mb-6 grid gap-4'>
          <InputComboboxPaginate
            control={form.control}
            name='marketingId'
            label='Marketing'
            optionValue='id'
            optionLabel='name'
            query={marketingsQuery}
            search={marketingSearch}
            getSingleQueryOptions={orpc.masterData.user.getById.queryOptions}
            setSearch={setMarketingSearch}
            mandatory
          />

          <InputComboboxPaginate
            control={form.control}
            name='customerId'
            label='Customer'
            optionValue='id'
            optionLabel='name'
            query={customersQuery}
            search={customerSearch}
            getSingleQueryOptions={
              orpc.masterData.customer.getById.queryOptions
            }
            setSearch={setCustomerSearch}
            mandatory
          />
        </div>
      </Form>

      <ItemsSection items={items} setItems={setItems} />
    </div>
  );
}
