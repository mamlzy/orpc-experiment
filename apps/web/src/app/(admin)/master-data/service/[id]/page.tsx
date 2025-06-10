'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import { updateServiceSchema, type UpdateServiceSchema } from '@repo/db/schema';

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
import { InputTextArea } from '@/components/inputs/rhf/input-text-area';
import { ErrorPageLoad } from '@/components/shared/error-page-load';

export default function Page() {
  const router = useRouter();
  const qc = useQueryClient();
  const params = useParams<{ id: string }>();

  const form = useForm({
    mode: 'all',
    resolver: zodResolver(updateServiceSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const serviceQuery = useQuery(
    orpc.masterData.service.getById.queryOptions({
      input: { id: params.id },
    })
  );

  useEffect(() => {
    if (serviceQuery.isSuccess) {
      const service = serviceQuery.data.data;

      form.setValue('name', service.name);
      form.setValue('description', service.description);
    }
  }, [serviceQuery.isSuccess]);

  const updateServiceMutation = useMutation(
    orpc.masterData.service.updateById.mutationOptions()
  );

  const onSubmit: SubmitHandler<UpdateServiceSchema> = async (values) => {
    updateServiceMutation.mutate(
      { params: { id: params.id }, body: values },
      {
        onSuccess: async () => {
          await qc.invalidateQueries({
            queryKey: orpc.masterData.service.key(),
          });

          toast.success('Service updated successfully!');
          router.push('/master-data/service');
        },
        onError: (error) => {
          console.error('Failed to update service:', error);

          toast.error('Failed to update service. Please try again.');
        },
      }
    );
  };

  if (serviceQuery.isPending) {
    return <Loader2Icon className='animate-spin' />;
  }

  if (serviceQuery.isError) {
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
              <Link href='/master-data/service'>Services</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='mb-6 text-3xl font-bold'>Edit Service</h2>

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

          <div className='flex justify-end gap-4'>
            <Button type='submit' disabled={updateServiceMutation.isPending}>
              {updateServiceMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
