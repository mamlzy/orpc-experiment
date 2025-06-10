'use client';

import * as React from 'react';
import { useORPC } from '@/context/orpc-context';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import type { CustomerTypeEnum } from '@repo/db/model';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

export const description = 'An interactive bar chart';

const chartConfig = {
  views: {
    label: 'Sales',
  },
  sales: {
    label: 'Sales',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function MarketTrends({
  customerType,
}: {
  customerType: CustomerTypeEnum;
}) {
  const orpc = useORPC();

  const marketTrendsQuery = useQuery(
    orpc.masterData.dashboard.totalRevenue.queryOptions({
      input: {
        customerType,
      },
    })
  );

  const marketTrends = Object.entries(marketTrendsQuery.data?.data ?? {}).map(
    ([year, sales]) => ({
      date: year,
      sales,
    })
  );

  return (
    <Card>
      <CardHeader className='grid-rows-none border-b'>
        <CardTitle>Market Trends</CardTitle>
      </CardHeader>
      <CardContent className='px-2 sm:p-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[280px] w-full'
        >
          <BarChart
            accessibilityLayer
            data={marketTrends}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  year: 'numeric',
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey='views'
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      year: 'numeric',
                    });
                  }}
                />
              }
            />
            <Bar dataKey='sales' fill='var(--primary)' />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
