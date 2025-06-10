'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useORPC } from '@/context/orpc-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import { authClient } from '@repo/auth/client';
import { createUserSchema, type CreateUserSchema } from '@repo/db/schema';

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
import { InputPassword } from '@/components/inputs/rhf/input-password';
import { InputText } from '@/components/inputs/rhf/input-text';

export default function Page() {
  const router = useRouter();
  const qc = useQueryClient();
  const orpc = useORPC();

  const form = useForm({
    mode: 'all',
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'user' as const,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (
      values: CreateUserSchema & { data: Record<string, string> }
    ) => {
      console.log('values', values);
      const { data, error } = await authClient.admin.createUser({
        ...values,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });

  const onSubmit: SubmitHandler<CreateUserSchema> = async (values) => {
    createUserMutation.mutate(
      {
        ...values,
        data: {
          username: values.username,
          photo: 'inspiry',
          companyId: 'inspiry',
        },
      },
      {
        onSuccess: async () => {
          await qc.invalidateQueries({
            queryKey: orpc.masterData.user.key(),
          });
          toast.success('User created successfully');
          router.push('/master-data/user');
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
              Master Data
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/master-data/user'>Users</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='mb-6 text-3xl font-bold'>Create User</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
          <InputText
            control={form.control}
            name='name'
            label='Name'
            mandatory
          />

          <InputText
            control={form.control}
            name='email'
            label='Email'
            mandatory
          />

          <InputText
            control={form.control}
            name='username'
            label='Username'
            mandatory
          />

          <InputPassword
            control={form.control}
            name='password'
            label='Password'
            mandatory
          />

          <InputCombobox
            control={form.control}
            name='role'
            options={[
              {
                value: 'admin',
                label: 'Admin',
              },
              {
                value: 'user',
                label: 'User',
              },
            ]}
            optionValue='value'
            optionLabel='label'
            mandatory
          />

          <div className='flex justify-end gap-4'>
            <Button type='submit' disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
