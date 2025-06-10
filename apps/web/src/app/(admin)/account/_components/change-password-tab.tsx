import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { KeyIcon, Loader2Icon } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { authClient } from '@repo/auth/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { InputPassword } from '@/components/inputs/rhf/input-password';

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(50, { message: 'Password cannot exceed 50 characters' }),
    newPassword: z
      .string()
      .trim()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(50, { message: 'Password cannot exceed 50 characters' }),
    confirmPassword: z
      .string()
      .trim()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(50, { message: 'Password cannot exceed 50 characters' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export function ChangePasswordTab() {
  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (values: ChangePasswordSchema) => {
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
  });

  const onPasswordSubmit: SubmitHandler<ChangePasswordSchema> = (values) => {
    changePasswordMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Password changed successfully');
        passwordForm.reset();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to change password');
      },
    });
  };

  return (
    <Card>
      <CardContent>
        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-medium'>Change Password</h3>
            <p className='text-muted-foreground text-sm'>
              Update your password to keep your account secure
            </p>
          </div>

          <Separator />

          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className='space-y-6'
            >
              {/* Current Password */}
              <InputPassword
                control={passwordForm.control}
                name='currentPassword'
                label='Current Password'
                placeholder='Enter your current password'
                mandatory
              />

              {/* New Password */}
              <InputPassword
                control={passwordForm.control}
                name='newPassword'
                label='New Password'
                placeholder='Enter your new password'
                mandatory
              />

              {/* Confirm Password */}
              <InputPassword
                control={passwordForm.control}
                name='confirmPassword'
                label='Confirm New Password'
                placeholder='Confirm your new password'
                mandatory
              />

              {/* Submit Button */}
              <div className='flex justify-end'>
                <Button
                  type='submit'
                  disabled={
                    changePasswordMutation.isPending ||
                    !passwordForm.formState.isValid
                  }
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2Icon className='size-4 animate-spin' />
                      Changing...
                    </>
                  ) : (
                    <>
                      <KeyIcon className='size-4' />
                      Change Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
