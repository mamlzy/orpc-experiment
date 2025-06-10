'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useORPC } from '@/context/orpc-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import { authClient } from '@repo/auth/client';
import { updateUserSchema, type UpdateUserSchema } from '@repo/db/schema';
import { adminUserIds } from '@repo/shared';

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
import { ErrorPageLoad } from '@/components/shared/error-page-load';

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();
  const orpc = useORPC();
  const { data: session } = authClient.useSession();

  const userQuery = useQuery(
    orpc.masterData.user.getById.queryOptions({
      input: {
        id: params.id,
      },
    })
  );

  const form = useForm({
    mode: 'all',
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: undefined,
      role: 'user' as const,
    },
    // values: {
    //   name: user?.name || '',
    //   email: user?.email || '',
    //   username: user?.username || '',
    //   password: '',
    //   role: user?.role! as 'user' | 'admin',
    // },
  });

  useEffect(() => {
    if (userQuery.isSuccess) {
      const user = userQuery.data.data;

      form.setValue('name', user.name);
      form.setValue('email', user.email);
      form.setValue('username', user.username!);
      form.setValue('role', user.role! as 'user' | 'admin');
    }
  }, [userQuery.isSuccess, form]);

  const updateUserMutation = useMutation(
    orpc.masterData.user.updateById.mutationOptions()
  );

  const onSubmit: SubmitHandler<UpdateUserSchema> = async (values) => {
    updateUserMutation.mutate(
      {
        params: {
          id: params.id,
        },
        body: { ...values, password: values.password || undefined },
      },
      {
        onSuccess: async () => {
          await qc.invalidateQueries({ queryKey: orpc.masterData.user.key() });

          toast.success('User updated successfully');
          router.push('/master-data/user');
        },
        onError: (error) => {
          console.error('error', error);
          toast.error(error.message);
        },
      }
    );
  };

  if (userQuery.isPending) {
    return <Loader2Icon className='animate-spin' />;
  }

  if (userQuery.isError) {
    return <ErrorPageLoad />;
  }

  // Authorization check: Protected users can only be edited by themselves
  if (adminUserIds.includes(params.id) && session?.user.id !== params.id) {
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
              <Link href='/master-data/user'>Users</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='mb-6 text-3xl font-bold'>Edit User</h2>

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
            <Button type='submit' disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
