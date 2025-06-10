'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useORPC } from '@/context/orpc-context';
import { useQuery } from '@tanstack/react-query';

// Import both coordinate sets
import { countryCoordinates } from '@/lib/countryCoordinates';
import { provinceCoordinates } from '@/lib/provinceCoordinates';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const Map = dynamic(() => import('./map'), {
  loading: () => <p>A map is loading</p>,
  ssr: false,
});

type CustomerMapProps = {
  customerType: 'DOMESTIC' | 'INTERNATIONAL';
};

export function CustomerMap({ customerType }: CustomerMapProps) {
  const orpc = useORPC();

  const totalCustomerByCountryQuery = useQuery(
    orpc.masterData.dashboard.totalCustomerByCountry.queryOptions({
      input: { customerType },
    })
  );

  const countryArray =
    totalCustomerByCountryQuery.data?.data.map(({ country, total }) => ({
      country: country && country !== '-' ? country : 'Unknown',
      customers: total,
    })) ?? [];

  // Set initial map configuration based on customer type
  const mapConfig =
    customerType === 'DOMESTIC'
      ? {
          coordinates: provinceCoordinates,
          initialCenter: [-2.5, 118.0] as [number, number],
          initialZoom: 5,
          selectPlaceholder: 'Select a province',
          title: 'Customer Location by Province',
        }
      : {
          coordinates: countryCoordinates,
          initialCenter: [20, 0] as [number, number],
          initialZoom: 2,
          selectPlaceholder: 'Select a country',
          title: 'Customer Location by Country',
        };

  return (
    <Card>
      <CardHeader className='border-b'>
        <CardTitle>{mapConfig.title}</CardTitle>
        <CardDescription>Showing location</CardDescription>
      </CardHeader>
      <CardContent>
        <Map
          data={countryArray}
          coordinates={mapConfig.coordinates}
          initialCenter={mapConfig.initialCenter}
          initialZoom={mapConfig.initialZoom}
          selectPlaceholder={mapConfig.selectPlaceholder}
        />
      </CardContent>
    </Card>
  );
}
