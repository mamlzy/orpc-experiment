'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useORPC } from '@/context/orpc-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import { createServiceSchema, type CreateServiceSchema } from '@repo/db/schema';

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

export default function Page() {
  const router = useRouter();
  const qc = useQueryClient();
  const orpc = useORPC();

  const form = useForm({
    mode: 'all',
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const createServiceMutation = useMutation(
    orpc.masterData.service.create.mutationOptions()
  );

  const onSubmit: SubmitHandler<CreateServiceSchema> = async (values) => {
    createServiceMutation.mutate(values, {
      onSuccess: async () => {
        await qc.invalidateQueries({
          queryKey: orpc.masterData.product.key(),
        });
        toast.success('Service created successfully');
        router.push('/master-data/service');
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
              <Link href='/master-data/service'>Services</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='mb-6 text-3xl font-bold'>Create Service</h2>

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
            <Button type='submit' disabled={createServiceMutation.isPending}>
              {createServiceMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
