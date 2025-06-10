'use client';

import * as React from 'react';
import { useORPC } from '@/context/orpc-context';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface CustomerBySectorProps {
  customerType: 'DOMESTIC' | 'INTERNATIONAL';
  showFooter?: boolean;
}

export function CustomerBySector({
  customerType,
  showFooter = false,
}: CustomerBySectorProps) {
  const orpc = useORPC();

  const getTotalCustomerBySectorQuery = useQuery(
    orpc.masterData.dashboard.totalCustomerBySector.queryOptions({
      input: { customerType },
    })
  );

  const formatSectorKey = (sector: string | null): string => {
    return (sector ?? 'Unknown').toLowerCase().replace(/\s+/g, '_');
  };

  const chartData =
    getTotalCustomerBySectorQuery.data?.data.map(
      ({ sector, total }, index) => ({
        sectorKey: formatSectorKey(sector),
        sectors: Number(total),
        fill: `var(--chart-${(index % 10) + 1})`,
      })
    ) ?? [];

  const chartConfig = Object.fromEntries(
    getTotalCustomerBySectorQuery.data?.data.map(({ sector }, index) => [
      formatSectorKey(sector),
      {
        label: sector ?? 'Unknown',
        color: `var(--chart-${(index % 10) + 1})`,
      },
    ]) ?? []
  );

  return (
    <Card className='flex flex-col'>
      <CardHeader className='grid-rows-none border-b'>
        <CardTitle>Customer by Sector</CardTitle>
      </CardHeader>

      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[360px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey='sectors'
              nameKey='sectorKey'
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    const totalCustomers = chartData.reduce(
                      (acc, curr) => acc + curr.sectors,
                      0
                    );
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalCustomers}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          Sectors
                        </tspan>
                      </text>
                    );
                  }

                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      {showFooter && (
        <CardFooter className='flex-col gap-2 text-sm'>
          <div className='flex items-center gap-2 font-medium leading-none'>
            Trending up by 5.2% this month <TrendingUp className='h-4 w-4' />
          </div>
          <div className='text-muted-foreground leading-none'>
            Showing total sectors for the last 6 months
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
