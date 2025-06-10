'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

import { authClient } from '@repo/auth/client';

import { env } from '@/lib/env';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function MenuToggle() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      router.push('/sign-in');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className='ring-primary ring-offset-background rounded-full border-none ring-offset-2 transition-[box-shadow] hover:ring-1'
        >
          <Avatar className='size-full'>
            <AvatarImage
              src={
                session?.user.image
                  ? `${env.NEXT_PUBLIC_API_BASE_URL}/pp/${session.user.image}`
                  : undefined
              }
              alt={session?.user.name || 'Account'}
            />
            <AvatarFallback className='text-xs'>
              {session?.user.name ? (
                session.user.name.charAt(0).toUpperCase()
              ) : (
                <User className='size-[1.2rem]' />
              )}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Hello {session?.user.name}</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href='/account'>Account</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Signing Out...
              </>
            ) : (
              'Sign Out'
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
