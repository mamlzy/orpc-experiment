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

import { createProductSchema, type CreateProductSchema } from '@repo/db/schema';

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
import { InputText } from '@/components/inputs/rhf/input-text';
import { InputTextArea } from '@/components/inputs/rhf/input-text-area';

export default function Page() {
  const router = useRouter();
  const qc = useQueryClient();
  const orpc = useORPC();

  const form = useForm({
    mode: 'all',
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: '',
      serviceId: '',
    },
  });

  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceSearchDebounce] = useDebouncedValue(serviceSearch, 300);

  const servicesQuery = useInfiniteQuery(
    orpc.masterData.service.getAll.infiniteOptions({
      initialPageParam: 1,
      getNextPageParam: getNextPageParamFn,
      input: (pageParam) => ({
        page: pageParam,
        limit: 10,
        name: serviceSearchDebounce,
      }),
    })
  );

  const createProductMutation = useMutation(
    orpc.masterData.product.create.mutationOptions()
  );

  const onSubmit: SubmitHandler<CreateProductSchema> = async (values) => {
    createProductMutation.mutate(values, {
      onSuccess: async () => {
        await qc.invalidateQueries({
          queryKey: orpc.masterData.product.key(),
        });
        toast.success('Product created successfully');
        router.push('/master-data/product');
      },
      onError: (error) => {
        console.error('error', error);

        toast.error(error.message);
      },
    });
  };

  return (
    <div className='container'>
      <Breadcrumb className='my-4'>
        <BreadcrumbList className='sm:gap-2'>
          <BreadcrumbItem>
            <BreadcrumbPage className='text-muted-foreground'>
              Master Data
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/master-data/product'>Products</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='mb-6 text-3xl font-bold'>Create Product</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
          <InputText
            control={form.control}
            name='name'
            label='Name'
            mandatory
          />

          <InputTextArea
            control={form.control}
            name='description'
            label='Description'
            placeholder='Enter description'
            mandatory
          />

          <InputComboboxPaginate
            control={form.control}
            name='serviceId'
            label='Service'
            optionValue='id'
            optionLabel='name'
            query={servicesQuery}
            search={serviceSearch}
            getSingleQueryOptions={orpc.masterData.service.getById.queryOptions}
            setSearch={setServiceSearch}
            mandatory
          />

          <div className='flex justify-end gap-4'>
            <Button type='submit' disabled={createProductMutation.isPending}>
              {createProductMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
