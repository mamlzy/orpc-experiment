import { useEffect, useState } from 'react';
import {
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

import type { SuccessResponse } from '@repo/shared/types';

import type { Outputs } from '@/lib/orpc';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { CustomerTable } from './customer-table';

type Props = {
  query: UseInfiniteQueryResult<
    InfiniteData<
      SuccessResponse<
        Outputs['masterData']['dashboard']['totalCustomerByCountry']['data']
      >,
      unknown
    >,
    Error
  >;
};

export function CustomerByRegion({ query }: Props) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && query.hasNextPage) {
      query.fetchNextPage();
    }
  }, [inView, query.hasNextPage]);

  // flatten all pages data
  const allCustomers = query.data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className='scrollbar-thin scrollbar-thumb-muted max-h-[300px] space-y-2 overflow-y-auto'>
      {allCustomers.map((customer, index) => (
        <Dialog key={`${customer.country}-${index}`}>
          <DialogTrigger asChild>
            <div
              className='hover:bg-accent flex cursor-pointer items-center rounded-md p-2'
              onClick={() => {
                setSelectedCountry(customer.country);
              }}
            >
              <Avatar className='h-9 w-9'>
                <AvatarFallback>
                  {customer.country?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='ml-4'>
                <p className='text-sm font-medium leading-none'>
                  {customer.country?.replace(/\b\w/g, (l) => l.toUpperCase()) ||
                    '-'}
                </p>
              </div>
              <div className='ml-auto font-medium'>{customer.total}</div>
            </div>
          </DialogTrigger>

          {selectedCountry && selectedCountry === customer.country && (
            <DialogContent className='max-w-[calc(100%-2rem)] sm:max-w-3xl'>
              <DialogHeader>
                <DialogTitle>Detail Negara</DialogTitle>
                <DialogDescription>
                  Data jumlah pelanggan berdasarkan negara.
                </DialogDescription>
              </DialogHeader>

              <div className='grid gap-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='country' className='text-right'>
                    Negara
                  </Label>
                  <Input
                    id='country'
                    value={selectedCountry}
                    disabled
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='totalCustomers' className='text-right'>
                    Total Pelanggan
                  </Label>
                  <Input
                    id='totalCustomers'
                    value={customer.total}
                    disabled
                    className='col-span-3'
                  />
                </div>

                <div>
                  <h3 className='text-lg font-semibold'>Daftar Pelanggan</h3>
                  <div>
                    <CustomerTable country={selectedCountry} />
                  </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      ))}

      {/* Loading indicator */}
      <div ref={ref} className='flex justify-center p-2'>
        {query.isFetchingNextPage && <Loader2Icon className='animate-spin' />}
      </div>
    </div>
  );
}
