'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useORPC } from '@/context/orpc-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebouncedValue } from '@mantine/hooks';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
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
import { ErrorPageLoad } from '@/components/shared/error-page-load';

import { ItemsSection } from './_components/items-section';
import type { CreateItemSchema } from './_components/shared';

export default function Page() {
  const params = useParams<{ id: string }>();
  const transactionId = params.id;
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

  const transactionQuery = useQuery(
    orpc.sales.transaction.getById.queryOptions({
      input: { id: transactionId, status: 'PENDING' },
      staleTime: Infinity,
    })
  );

  useEffect(() => {
    if (transactionQuery.isSuccess) {
      const { marketingId, customerId, items } = transactionQuery.data.data;

      const formatedItems: CreateItemSchema[] = items.map(
        ({ id: _id, product, ...item }) => ({
          ...item,
          price: Number(item.price),
          productName: product.name,
        })
      );

      form.reset({
        marketingId,
        customerId,
        items: [],
      });
      setItems(formatedItems);
    }
  }, [transactionQuery.isSuccess]);

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

  const updateTransactionMutation = useMutation(
    orpc.sales.transaction.updateById.mutationOptions()
  );

  const onSubmit: SubmitHandler<CreateTransactionSchema> = async (values) => {
    const formattedItems = items.map(
      ({ productName: _productName, ...item }) => item
    );

    updateTransactionMutation.mutate(
      {
        params: { id: transactionId },
        body: { ...values, items: formattedItems },
      },
      {
        onSuccess: async () => {
          await qc.invalidateQueries({
            queryKey: orpc.sales.transaction.key(),
          });
          toast.success('Transaction updated successfully');
          router.push('/sales/transaction');
        },
        onError: (error) => {
          console.error('error', error);

          toast.error(error.message);
        },
      }
    );
  };

  if (transactionQuery.isPending) {
    return <Loader2Icon className='animate-spin' />;
  }

  if (transactionQuery.isError) {
    return <ErrorPageLoad />;
  }

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
        <h2 className='text-3xl font-bold'>Edit Transaction</h2>

        <Button
          type='submit'
          disabled={updateTransactionMutation.isPending}
          onClick={form.handleSubmit(onSubmit)}
        >
          {updateTransactionMutation.isPending ? 'Updating...' : 'Update'}
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
