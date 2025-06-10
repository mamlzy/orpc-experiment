'use client';

import * as React from 'react';
import { useORPC } from '@/context/orpc-context';
import { useQuery } from '@tanstack/react-query';
import { Label, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export function PicCustomer() {
  const orpc = useORPC();

  const getTotalPicCustomerQuery = useQuery(
    orpc.masterData.dashboard.totalPicCustomer.queryOptions()
  );

  const formatPicKey = (position: string | null): string => {
    return (position ?? 'Unknown').toLowerCase().replace(/\s+/g, '_');
  };

  const chartData =
    getTotalPicCustomerQuery.data?.data.map(({ position, total }, index) => ({
      positionKey: formatPicKey(position),
      positions: Number(total),
      fill: `var(--chart-${(index % 10) + 1})`,
    })) ?? [];

  const chartConfig = Object.fromEntries(
    getTotalPicCustomerQuery.data?.data.map(({ position }, index) => [
      formatPicKey(position),
      {
        label: position ?? 'Unknown',
        color: `var(--chart-${(index % 10) + 1})`,
      },
    ]) ?? []
  );

  return (
    <Card className='flex flex-col'>
      <CardHeader className='grid-rows-none border-b'>
        <CardTitle>PIC Customer</CardTitle>
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
              dataKey='positions'
              nameKey='positionKey'
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    const totalCustomers = chartData.reduce(
                      (acc, curr) => acc + curr.positions,
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
                          Pics
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
    </Card>
  );
}
