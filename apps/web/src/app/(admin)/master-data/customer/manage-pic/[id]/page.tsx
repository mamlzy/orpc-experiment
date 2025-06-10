'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import {
  createCustomerPicSchema,
  updateCustomerPicSchema,
  type CreateCustomerPicSchema,
  type UpdateCustomerPicSchema,
} from '@repo/db/schema';

import { orpc } from '@/lib/orpc';
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
import { InputText } from '@/components/inputs/rhf/input-text';
import { ErrorPageLoad } from '@/components/shared/error-page-load';

import { CustomerPicTable } from './_components/customer-pic-table';
import type { CustomerOutput } from './types';

type FormValues = CreateCustomerPicSchema | UpdateCustomerPicSchema;

export default function Page() {
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [selectedEditPic, setSelectedEditPic] = useState<CustomerOutput | null>(
    null
  );

  const form = useForm<FormValues>({
    mode: 'all',
    resolver: zodResolver(
      selectedEditPic ? updateCustomerPicSchema : createCustomerPicSchema
    ),
    defaultValues: {
      picName: '',
      position: '',
      email: '',
      phone: '',
      address: '',
      customerId: '',
    },
  });

  useEffect(() => {
    form.setValue('customerId', params.id);
  }, [params.id]);

  // Effect to populate form when editing
  useEffect(() => {
    if (selectedEditPic) {
      form.reset({
        picName: selectedEditPic.picName,
        position: selectedEditPic.position || '',
        email: selectedEditPic.email || '',
        phone: selectedEditPic.phone || '',
        address: selectedEditPic.address || '',
        customerId: params.id,
      });
    } else {
      form.reset({
        picName: '',
        position: '',
        email: '',
        phone: '',
        address: '',
        customerId: params.id,
      });
    }
  }, [selectedEditPic, params.id]);

  const customerQuery = useQuery(
    orpc.masterData.customer.getById.queryOptions({
      input: {
        id: params.id,
      },
    })
  );

  const createCustomerPicMutation = useMutation(
    orpc.masterData.customerPic.create.mutationOptions()
  );

  const updateCustomerPicMutation = useMutation(
    orpc.masterData.customerPic.updateById.mutationOptions()
  );

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    if (selectedEditPic) {
      updateCustomerPicMutation.mutate(
        {
          params: { id: selectedEditPic.id },
          body: values as UpdateCustomerPicSchema,
        },
        {
          onSuccess: async () => {
            await qc.invalidateQueries({
              queryKey: orpc.masterData.customerPic.key(),
            });
            toast.success('PIC updated');
            setSelectedEditPic(null);
            form.reset();
          },
          onError: (error) => {
            console.error('error =>', error);
            toast.error('Failed to update PIC');
          },
        }
      );
    } else {
      createCustomerPicMutation.mutate(values as CreateCustomerPicSchema, {
        onSuccess: async () => {
          await qc.invalidateQueries({
            queryKey: orpc.masterData.customerPic.key(),
          });
          toast.success('PIC created');
          form.reset();
        },
        onError: (error) => {
          console.error('error =>', error);
          toast.error('Failed to create PIC');
        },
      });
    }
  };

  if (customerQuery.isPending) {
    return <Loader2Icon className='animate-spin' />;
  }

  if (customerQuery.isError) {
    return <ErrorPageLoad />;
  }

  return (
    <div className='container mx-auto'>
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
            <BreadcrumbPage>Manage Pic</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='mb-6 text-3xl tracking-tighter'>
        Manage Pic For:{' '}
        <span className='font-medium'>{customerQuery.data?.data.name}</span>
      </h2>

      <div className='grid gap-8 lg:grid-cols-2'>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='grid items-start gap-4'
            >
              {/* Name */}
              <InputText control={form.control} name='picName' mandatory />

              {/* Position */}
              <InputText control={form.control} name='position' />

              {/* Email */}
              <InputText control={form.control} name='email' />

              {/* Phone */}
              <InputText control={form.control} name='phone' />

              {/* Address */}
              <InputText control={form.control} name='address' />

              {/* Buttons */}
              <div className='grid justify-end'>
                {selectedEditPic ? (
                  <div className='flex gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setSelectedEditPic(null)}
                      disabled={updateCustomerPicMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      disabled={updateCustomerPicMutation.isPending}
                      className='bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                    >
                      {updateCustomerPicMutation.isPending
                        ? 'Updating...'
                        : 'Update'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type='submit'
                    disabled={createCustomerPicMutation.isPending}
                  >
                    {createCustomerPicMutation.isPending
                      ? 'Submitting...'
                      : 'Submit'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
        <div>
          <CustomerPicTable
            selectedEditPic={selectedEditPic}
            setSelectedEditPic={setSelectedEditPic}
          />
        </div>
      </div>
    </div>
  );
}
