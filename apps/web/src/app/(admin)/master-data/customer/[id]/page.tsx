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
  createCustomerSchema,
  type CreateCustomerSchema,
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
import { InputCombobox } from '@/components/inputs/rhf/input-combobox';
import { InputComboboxPaginate } from '@/components/inputs/rhf/input-combobox-paginate';
import { InputText } from '@/components/inputs/rhf/input-text';
import { InputTextArea } from '@/components/inputs/rhf/input-text-area';
import { ErrorPageLoad } from '@/components/shared/error-page-load';

import {
  businessEntityOptions,
  customerStatusOptions,
  customerTypeOptions,
} from '../options';

export default function Page() {
  const router = useRouter();
  const orpc = useORPC();
  const qc = useQueryClient();
  const params = useParams<{ id: string }>();

  const form = useForm({
    mode: 'all',
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      businessEntity: 'PT',
      customerType: 'INTERNATIONAL',
      name: '',
      pareto: '',
      address: '',
      telephone: '',
      email: '',
      website: '',
      country: '',
      sector: '',
      latitude: '',
      longitude: '',
      logo: '',
      companyId: '',
      marketingId: null,
      status: 'BANK_DATA',
      description: '',
    },
  });

  const customerQuery = useQuery(
    orpc.masterData.customer.getById.queryOptions({
      input: { id: params.id },
    })
  );

  useEffect(() => {
    if (customerQuery.isSuccess) {
      const customer = customerQuery.data.data;

      form.setValue('businessEntity', customer.businessEntity);
      form.setValue('customerType', customer.customerType);
      form.setValue('name', customer.name);
      form.setValue('pareto', customer.pareto || '');
      form.setValue('address', customer.address || '');
      form.setValue('telephone', customer.telephone || '');
      form.setValue('email', customer.email || '');
      form.setValue('website', customer.website || '');
      form.setValue('country', customer.country || '');
      form.setValue('sector', customer.sector || '');
      form.setValue('latitude', customer.latitude || '');
      form.setValue('longitude', customer.longitude || '');
      form.setValue('logo', customer.logo || '');
      form.setValue('companyId', customer.companyId!);
      form.setValue('marketingId', customer.marketingId);
      form.setValue('status', customer.status!);
      form.setValue('description', customer.description || '');
    }
  }, [customerQuery.isSuccess]);

  const [companySearch, setCompanySearch] = useState('');
  const [companySearchDebounce] = useDebouncedValue(companySearch, 300);

  const companiesQuery = useInfiniteQuery(
    orpc.masterData.company.getAll.infiniteOptions({
      initialPageParam: 1,
      getNextPageParam: getNextPageParamFn,
      input: (pageParam) => ({
        page: pageParam,
        limit: 10,
        name: companySearchDebounce,
      }),
    })
  );

  const updateCustomerMutation = useMutation(
    orpc.masterData.customer.updateById.mutationOptions()
  );

  const onSubmit: SubmitHandler<CreateCustomerSchema> = (values) => {
    updateCustomerMutation.mutate(
      {
        params: { id: params.id },
        body: values,
      },
      {
        onSuccess: async () => {
          await qc.invalidateQueries({
            queryKey: orpc.masterData.customer.key(),
          });

          toast.success('Customer updated successfully');
          router.push('/master-data/customer');
        },
        onError: (error) => {
          console.error('Failed to update customer:', error);

          toast.error('Failed to update customer');
        },
      }
    );
  };

  if (customerQuery.isPending) {
    return <Loader2Icon className='animate-spin' />;
  }

  if (customerQuery.isError) {
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
              <Link href='/master-data/customer'>Customers</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='mb-6 text-3xl font-bold'>Edit Customer</h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='grid items-start gap-4 sm:grid-cols-2'
        >
          <InputCombobox
            control={form.control}
            name='businessEntity'
            options={businessEntityOptions}
            optionValue='value'
            optionLabel='label'
            mandatory
          />

          <InputText
            control={form.control}
            name='name'
            label='Customer Name'
            mandatory
          />

          <InputCombobox
            control={form.control}
            name='customerType'
            options={customerTypeOptions}
            optionValue='value'
            optionLabel='label'
            mandatory
          />

          <InputTextArea
            control={form.control}
            name='address'
            label='Address'
            mandatory
          />

          <InputText
            control={form.control}
            name='telephone'
            label='Telephone'
          />

          <InputText
            control={form.control}
            name='email'
            label='Email'
            mandatory
          />

          <InputText control={form.control} name='latitude' label='Latitude' />

          <InputText
            control={form.control}
            name='longitude'
            label='Longitude'
          />

          <InputComboboxPaginate
            control={form.control}
            name='companyId'
            label='Company'
            optionValue='id'
            optionLabel='companyName'
            query={companiesQuery}
            search={companySearch}
            getSingleQueryOptions={orpc.masterData.company.getById.queryOptions}
            setSearch={setCompanySearch}
            mandatory
          />

          <InputCombobox
            control={form.control}
            name='status'
            options={customerStatusOptions}
            optionValue='value'
            optionLabel='label'
            mandatory
          />

          <div className='col-span-full flex justify-end gap-4'>
            <Button type='submit' disabled={updateCustomerMutation.isPending}>
              {updateCustomerMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
