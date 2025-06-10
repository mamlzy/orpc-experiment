'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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

import { updateProductSchema, type UpdateProductSchema } from '@repo/db/schema';

import { orpc } from '@/lib/orpc';
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
import { ErrorPageLoad } from '@/components/shared/error-page-load';

export default function Page() {
  const router = useRouter();
  const qc = useQueryClient();
  const params = useParams<{ id: string }>();

  const form = useForm({
    mode: 'all',
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: '',
      description: '',
      serviceId: '',
    },
  });

  const productQuery = useQuery(
    orpc.masterData.product.getById.queryOptions({
      input: { id: params.id },
    })
  );

  useEffect(() => {
    if (productQuery.isSuccess) {
      const product = productQuery.data.data;

      form.setValue('name', product.name);
      form.setValue('description', product.description);
      form.setValue('serviceId', product.serviceId);
    }
  }, [productQuery.isSuccess]);

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

  const updateProductMutation = useMutation(
    orpc.masterData.product.updateById.mutationOptions()
  );

  const onSubmit: SubmitHandler<UpdateProductSchema> = async (values) => {
    updateProductMutation.mutate(
      { params: { id: params.id }, body: values },
      {
        onSuccess: async () => {
          await qc.invalidateQueries({
            queryKey: orpc.masterData.product.key(),
          });

          toast.success('Product updated successfully!');
          router.push('/master-data/product');
        },
        onError: (error) => {
          console.error('Failed to update product:', error);

          toast.error('Failed to update product. Please try again.');
        },
      }
    );
  };

  if (productQuery.isPending) {
    return <Loader2Icon className='animate-spin' />;
  }

  if (productQuery.isError) {
    return <ErrorPageLoad />;
  }

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
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='mb-6 text-3xl font-bold'>Edit Product</h2>

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
            <Button type='submit' disabled={updateProductMutation.isPending}>
              {updateProductMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
