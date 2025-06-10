'use client';

import { useEffect, useState } from 'react';
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  ZoomControl,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type MapProps = {
  data: {
    country: string;
    customers: number;
  }[];
  coordinates: Record<string, { lat: number; lng: number }>;
  initialCenter: [number, number];
  initialZoom: number;
  selectPlaceholder: string;
};

// Component to handle map view changes
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

export default function Map({
  data,
  coordinates,
  initialCenter,
  initialZoom,
  selectPlaceholder,
}: MapProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Find the maximum number of customers to scale marker sizes
  const maxCustomers = Math.max(...data.map((item) => item.customers));

  // Function to calculate marker size based on customer count
  const getMarkerRadius = (customers: number) => {
    const minRadius = 5;
    const maxRadius = 20;
    return minRadius + (customers / maxCustomers) * (maxRadius - minRadius);
  };

  // Function to calculate marker color based on customer count
  const getMarkerColor = (customers: number) => {
    const maxCustomers = Math.max(...data.map((item) => item.customers));
    const minCustomers = Math.min(...data.map((item) => item.customers));
    const range = maxCustomers - minCustomers;
    const thresholdLow = minCustomers + range * 0.33;
    const thresholdMedium = minCustomers + range * 0.66;

    if (customers <= thresholdLow) {
      return 'rgb(34, 197, 94)'; // Green (Low)
    }
    if (customers <= thresholdMedium) {
      return 'rgb(252, 211, 77)'; // Yellow (Medium)
    }
    return 'rgb(248, 113, 113)'; // Red (High)
  };

  // Handle country selection
  const handleCountrySelect = (country: string) => {
    const coords = coordinates[country];
    if (coords) {
      setSelectedCountry(country);
      setMapCenter([coords.lat, coords.lng]);
      setMapZoom(initialZoom === 5 ? 6 : 4); // Higher zoom for domestic, lower for international
    }
  };

  // Reset map view
  const resetMapView = () => {
    setSelectedCountry(null);
    setMapCenter(initialCenter);
    setMapZoom(initialZoom);
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap gap-2'>
        <Select
          value={selectedCountry || undefined}
          onValueChange={(value) => handleCountrySelect(value)}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder={selectPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {data.map((item, idx) => (
                <SelectItem key={idx} value={item.country}>
                  {item.country} ({item.customers} customers)
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {selectedCountry && <Button onClick={resetMapView}>Reset View</Button>}
      </div>

      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        scrollWheelZoom
        style={{ height: '500px', width: '100%' }}
        zoomControl={false}
        className='rounded-md'
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        <ZoomControl position='bottomright' />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        {data.map((item) => {
          const coords = coordinates[item.country];
          if (!coords) return null;

          return (
            <CircleMarker
              key={item.country}
              center={[coords.lat, coords.lng]}
              radius={getMarkerRadius(item.customers)}
              fillColor={getMarkerColor(item.customers)}
              color='#fff'
              weight={1}
              fillOpacity={0.8}
              eventHandlers={{
                click: () => handleCountrySelect(item.country),
                mouseover: () => setHoveredCountry(item.country),
                mouseout: () => setHoveredCountry(null),
              }}
            >
              <Tooltip
                direction='top'
                offset={[0, -5]}
                opacity={1}
                permanent={hoveredCountry === item.country}
              >
                {item.country}
              </Tooltip>
              <Popup>
                <div className='p-1'>
                  <h3 className='font-bold'>{item.country}</h3>
                  <p className='text-sm'>Customers: {item.customers}</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <Card className='gap-0 rounded-lg p-3 shadow-sm'>
        <div className='flex items-center gap-4 text-sm'>
          <div className='flex items-center gap-1'>
            <div className='h-3 w-3 rounded-full bg-green-500' />
            <span>Low</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='h-4 w-4 rounded-full bg-yellow-500' />
            <span>Medium</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='h-5 w-5 rounded-full bg-red-500' />
            <span>High</span>
          </div>
          <span className='text-muted-foreground text-xs'>
            Circle size represents customer count
          </span>
        </div>
      </Card>
    </div>
  );
}
