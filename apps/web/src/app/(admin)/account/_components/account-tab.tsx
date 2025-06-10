import { useState } from 'react';
import { useORPC } from '@/context/orpc-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  CameraIcon,
  Loader2Icon,
  SaveIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

import { authClient } from '@repo/auth/client';
import { updateUserSchema, type UpdateUserSchema } from '@repo/db/schema';

import { env } from '@/lib/env';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { InputText } from '@/components/inputs/rhf/input-text';

export function AccountTab() {
  const { data: session, refetch } = authClient.useSession();
  const orpc = useORPC();

  const [selectedImage, setSelectedImage] = useState<File | undefined>(
    undefined
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRemovingImage, setIsRemovingImage] = useState(false);

  // Account settings form
  const accountForm = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      image: undefined,
      imageFile: undefined,
      password: undefined,
      role: undefined,
    },
    values: {
      name: session?.user.name || '',
      email: session?.user.email || '',
      username: session?.user.username || '',
      image: session?.user.image || undefined,
      role: session?.user.role as 'admin' | 'user',
    },
  });

  const updateAccountMutation = useMutation(
    orpc.masterData.user.updateById.mutationOptions()
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      setSelectedImage(file);
      setIsRemovingImage(false);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(undefined);
    setImagePreview(null);
    setIsRemovingImage(true);

    // Reset the file input
    const fileInput = document.getElementById('picture') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onAccountSubmit: SubmitHandler<UpdateUserSchema> = (values) => {
    if (!session) return;

    const updateData: UpdateUserSchema = {
      ...values,
    };

    // Handle image removal
    if (isRemovingImage) {
      updateData.image = null;
    } else if (selectedImage) {
      updateData.imageFile = selectedImage;
    }

    updateAccountMutation.mutate(
      {
        params: { id: session.user.id },
        body: updateData,
      },
      {
        onSuccess: async () => {
          toast.success('Account updated successfully');

          // Refetch session data first to get updated image info
          await refetch();

          // Then reset local state after we have fresh data
          setSelectedImage(undefined);
          setImagePreview(null);
          setIsRemovingImage(false);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update profile');
        },
      }
    );
  };

  if (!session) return null;

  return (
    <Card>
      <CardContent>
        <Form {...accountForm}>
          <form
            onSubmit={accountForm.handleSubmit(onAccountSubmit)}
            className='space-y-6'
          >
            {/* Account Picture Section */}
            <div className='space-y-4'>
              <Label>Account Picture</Label>
              <div className='flex items-center space-x-4'>
                <Avatar className='h-20 w-20'>
                  <AvatarImage
                    src={
                      isRemovingImage
                        ? undefined
                        : imagePreview ||
                          (session.user.image
                            ? `${env.NEXT_PUBLIC_API_BASE_URL}/pp/${session.user.image}`
                            : undefined)
                    }
                    alt={session.user.name || 'Account'}
                  />
                  <AvatarFallback className='text-lg'>
                    {session.user.name ? (
                      session.user.name.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon className='h-8 w-8' />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className='space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <Input
                      id='picture'
                      type='file'
                      accept='image/*'
                      onChange={handleImageChange}
                      className='hidden'
                    />
                    <Label htmlFor='picture' className='cursor-pointer'>
                      <Button type='button' variant='outline' size='sm' asChild>
                        <span>
                          <CameraIcon className='size-4' />
                          Change Picture
                        </span>
                      </Button>
                    </Label>
                    {(session.user.image || selectedImage || imagePreview) &&
                      !isRemovingImage && (
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={handleRemoveImage}
                          className='text-destructive hover:text-destructive'
                        >
                          <XIcon className='size-4' />
                          Remove Picture
                        </Button>
                      )}
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    JPG, PNG. Max size 2MB.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Name */}
            <InputText
              control={accountForm.control}
              name='name'
              label='Full Name'
              placeholder='Enter your full name'
            />

            {/* Email Display (Read-only) */}
            <div className='space-y-2'>
              <Label>Email Address</Label>
              <Input
                value={session.user.email || 'Not set'}
                disabled
                className='text-muted-foreground'
              />
              <p className='text-muted-foreground text-xs'>
                Contact support to change your email address.
              </p>
            </div>

            {/* Additional Info */}
            <div className='space-y-2'>
              <Label>Username</Label>
              <Input
                value={session.user.username || 'Not set'}
                disabled
                className='text-muted-foreground'
              />
              <p className='text-muted-foreground text-xs'>
                Your unique username identifier.
              </p>
            </div>

            {/* Submit Button */}
            <div className='flex justify-end'>
              <Button
                type='submit'
                disabled={
                  updateAccountMutation.isPending ||
                  (!accountForm.formState.isDirty &&
                    !selectedImage &&
                    !isRemovingImage)
                }
              >
                {updateAccountMutation.isPending ? (
                  <>
                    <Loader2Icon className='size-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className='size-4' />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
