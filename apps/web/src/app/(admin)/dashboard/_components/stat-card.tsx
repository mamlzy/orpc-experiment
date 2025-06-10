import type { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function StatCard({
  title,
  value,
  icon: Icon,
  isPending,
}: {
  title: string;
  value: string | number | undefined;
  icon: LucideIcon;
  isPending: boolean;
}) {
  return (
    <Card className='gap-2'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className='text-muted-foreground size-4' />
      </CardHeader>
      <CardContent className='flex text-2xl'>
        {isPending ? (
          <Skeleton className='h-[1em] w-[5ch]' />
        ) : (
          <span className='font-bold leading-none'>{value}</span>
        )}
      </CardContent>
    </Card>
  );
}
