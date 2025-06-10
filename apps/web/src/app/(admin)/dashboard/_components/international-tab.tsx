import { useORPC } from '@/context/orpc-context';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  UserCheckIcon,
  UserCogIcon,
  UsersRoundIcon,
  UserXIcon,
} from 'lucide-react';

import { getNextPageParamFn } from '@/lib/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { CustomerByRegion } from './customer-by-region/customer-by-region';
import { CustomerBySector } from './customer-by-sector';
import { CustomerBySectorTable } from './customer-by-sector-table';
import { CustomerMap } from './customer-map';
import { MarketTrends } from './market-trends';
import { PicCustomer } from './pic-customer';
import { PicCustomerTable } from './pic-customer-table';
import { StatCard } from './stat-card';

export function InternationalTab() {
  const orpc = useORPC();

  const totalCustomerInternationalQuery = useQuery(
    orpc.masterData.dashboard.totalCustomer.queryOptions({
      input: { customerType: 'INTERNATIONAL' },
    })
  );

  const totalCustomerByCountryQuery = useInfiniteQuery(
    orpc.masterData.dashboard.totalCustomerByCountry.infiniteOptions({
      initialPageParam: 1,
      getNextPageParam: getNextPageParamFn,
      input: (pageParam) => ({
        page: pageParam,
        customerType: 'INTERNATIONAL',
      }),
    })
  );

  return (
    <>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Total Customer'
          value={totalCustomerInternationalQuery.data?.data.total_customer}
          isPending={totalCustomerInternationalQuery.isPending}
          icon={UsersRoundIcon}
        />
        <StatCard
          title='Customer Have PIC'
          value={
            totalCustomerInternationalQuery.data?.data.total_customer_with_pic
          }
          isPending={totalCustomerInternationalQuery.isPending}
          icon={UserCheckIcon}
        />
        <StatCard
          title="Customer Don't Have PIC"
          value={
            totalCustomerInternationalQuery.data?.data
              .total_customer_without_pic
          }
          isPending={totalCustomerInternationalQuery.isPending}
          icon={UserXIcon}
        />
        <StatCard
          title='Active Customer'
          value={
            totalCustomerInternationalQuery.data?.data.total_active_customer
          }
          isPending={totalCustomerInternationalQuery.isPending}
          icon={UserCogIcon}
        />
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-8'>
        <div className='col-span-8'>
          <CustomerMap customerType='INTERNATIONAL' />
        </div>
        <div className='col-span-5'>
          <MarketTrends customerType='INTERNATIONAL' />
        </div>
        <Card className='col-span-4 md:col-span-3'>
          <CardHeader className='grid-rows-none border-b'>
            <CardTitle>Customer by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerByRegion query={totalCustomerByCountryQuery} />
          </CardContent>
        </Card>
        <div className='col-span-4'>
          <PicCustomerTable />
        </div>
        <div className='col-span-4'>
          <PicCustomer />
        </div>
        <div className='col-span-4'>
          <CustomerBySectorTable customerType='INTERNATIONAL' />
        </div>
        <div className='col-span-4'>
          <CustomerBySector customerType='INTERNATIONAL' />
        </div>
      </div>
    </>
  );
}
