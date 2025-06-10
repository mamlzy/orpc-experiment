import { StatCard } from '@/app/(admin)/dashboard/_components/stat-card';
import { useORPC } from '@/context/orpc-context';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  BuildingIcon,
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

export function DomesticTab() {
  const orpc = useORPC();

  const totalCustomerDomesticQuery = useQuery(
    orpc.masterData.dashboard.totalCustomer.queryOptions({
      input: { customerType: 'DOMESTIC' },
    })
  );

  const totalCustomerByProvinceQuery = useInfiniteQuery(
    orpc.masterData.dashboard.totalCustomerByCountry.infiniteOptions({
      initialPageParam: 1,
      getNextPageParam: getNextPageParamFn,
      input: (pageParam) => ({
        page: pageParam,
        customerType: 'DOMESTIC',
      }),
    })
  );

  return (
    <>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Total Customer'
          value={totalCustomerDomesticQuery.data?.data.total_customer}
          isPending={totalCustomerDomesticQuery.isPending}
          icon={UsersRoundIcon}
        />
        <StatCard
          title='Active Customer'
          value={totalCustomerDomesticQuery.data?.data.total_active_customer}
          isPending={totalCustomerDomesticQuery.isPending}
          icon={UserCogIcon}
        />
        <StatCard
          title='Inactive Customer'
          value={totalCustomerDomesticQuery.data?.data.total_inactive_customer}
          isPending={totalCustomerDomesticQuery.isPending}
          icon={UserXIcon}
        />
        <StatCard
          title='Bank Data'
          value={totalCustomerDomesticQuery.data?.data.total_bank_data_customer}
          isPending={totalCustomerDomesticQuery.isPending}
          icon={BuildingIcon}
        />
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-8'>
        <div className='col-span-8'>
          <CustomerMap customerType='DOMESTIC' />
        </div>
        <div className='col-span-5'>
          <MarketTrends customerType='DOMESTIC' />
        </div>
        <Card className='col-span-4 md:col-span-3'>
          <CardHeader className='grid-rows-none border-b'>
            <CardTitle>Customer by Province</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerByRegion query={totalCustomerByProvinceQuery} />
          </CardContent>
        </Card>
        <div className='col-span-4'>
          <PicCustomer />
        </div>
        <div className='col-span-4'>
          <CustomerBySector customerType='DOMESTIC' />
        </div>
        <div className='col-span-8'>
          <CustomerBySectorTable customerType='DOMESTIC' />
        </div>
      </div>
    </>
  );
}
