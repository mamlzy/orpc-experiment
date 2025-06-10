'use client';

import { useQueryState } from 'nuqs';

import { authClient } from '@repo/auth/client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDateRangePicker } from '@/components/date-range-picker';

import { DomesticTab } from './_components/domestic-tab';
import { InternationalTab } from './_components/international-tab';

export function PageClient() {
  const { data: session } = authClient.useSession();

  const [tab, setTab] = useQueryState('tab', { defaultValue: 'international' });

  return (
    <div className='container mx-auto'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-2xl tracking-tight'>
          Hi, Welcome back{' '}
          <span className='font-semibold'>{session?.user.name}</span> 👋
        </h2>
        <div className='hidden items-center space-x-2 md:flex'>
          <CalendarDateRangePicker />
          <Button>Download</Button>
        </div>
      </div>
      <Tabs defaultValue={tab} onValueChange={setTab} className='space-y-4'>
        <TabsList>
          <TabsTrigger value='international'>International</TabsTrigger>
          <TabsTrigger value='domestic'>Domestic</TabsTrigger>
        </TabsList>
        <TabsContent value='international' className='space-y-4'>
          <InternationalTab />
        </TabsContent>
        <TabsContent value='domestic' className='space-y-4'>
          <DomesticTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
