'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { authClient } from '@repo/auth/client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { InputText } from '@/components/inputs/rhf/input-text';

const loginSchema = z.object({
  username: z.string().min(2),

  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(50, { message: 'Password cannot exceed 50 characters' }),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function Page() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginSchema) => {
      const { error, data } = await authClient.signIn.username({
        username: values.username,
        password: values.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });

  const onSubmit: SubmitHandler<LoginSchema> = (values) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        router.replace('/dashboard');
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return (
    <div className='grid min-h-screen place-items-center p-4'>
      <Card className='mx-auto w-full max-w-md'>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Please sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex flex-col gap-4'
            >
              {/* Username */}
              <InputText
                control={form.control}
                name='username'
                placeholder='Enter your username'
              />

              {/* Password */}
              <InputText
                control={form.control}
                name='password'
                placeholder='Enter your password'
                type='password'
              />

              {/* Submit */}
              <Button
                className='mt-4 w-full'
                type='submit'
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className='size-4 animate-spin' />
                    Loading...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
