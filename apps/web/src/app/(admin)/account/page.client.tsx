'use client';

import { KeyIcon, Loader2Icon, SettingsIcon } from 'lucide-react';
import { useQueryState } from 'nuqs';

import { authClient } from '@repo/auth/client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { AccountTab } from './_components/account-tab';
import { ChangePasswordTab } from './_components/change-password-tab';

export function PageClient() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'account',
  });

  if (sessionLoading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <Loader2Icon className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <p className='text-muted-foreground'>
          Please sign in to view your account
        </p>
      </div>
    );
  }

  return (
    <div className='pt-4'>
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Account Settings
          </h1>
          <p className='text-muted-foreground'>
            Manage your account information and preferences
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-4'
        >
          <TabsList className='grid w-fit grid-cols-2'>
            <TabsTrigger value='account' className='flex items-center gap-2'>
              <SettingsIcon className='h-4 w-4' />
              Account
            </TabsTrigger>
            <TabsTrigger value='password' className='flex items-center gap-2'>
              <KeyIcon className='h-4 w-4' />
              Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value='account' className='space-y-6'>
            <AccountTab />
          </TabsContent>

          <TabsContent value='password' className='space-y-6'>
            <ChangePasswordTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
