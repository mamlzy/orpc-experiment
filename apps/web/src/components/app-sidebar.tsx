'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Collapsible, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import {
  AudioWaveformIcon,
  BuildingIcon,
  ChevronRight,
  CircleGaugeIcon,
  FileTextIcon,
  GalleryVerticalEndIcon,
  PackageIcon,
  ReceiptIcon,
  UsersIcon,
  WrenchIcon,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

// Sidebar data structure
const sidebarData = {
  versions: ['1.0.1', '1.1.0-alpha', '2.0.0-beta1'],
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Sarana Mulya Grafika',
      logo: GalleryVerticalEndIcon,
      plan: 'Enterprise',
    },
    {
      name: 'Inspiry',
      logo: AudioWaveformIcon,
      plan: 'Startup',
    },
  ],
  groups: [
    {
      label: 'Dashboard',
      nav: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: CircleGaugeIcon,
          isActive: false,
          items: [],
        },
      ],
    },
    {
      label: 'Master Data',
      nav: [
        {
          title: 'User',
          url: '/master-data/user',
          icon: UsersIcon,
          isActive: false,
          items: [],
        },
        {
          title: 'Customer',
          url: '/master-data/customer',
          icon: BuildingIcon,
          isActive: false,
          items: [],
        },
        {
          title: 'Product',
          url: '/master-data/product',
          icon: PackageIcon,
          isActive: false,
          items: [],
        },
        {
          title: 'Service',
          url: '/master-data/service',
          icon: WrenchIcon,
          isActive: false,
          items: [],
        },
      ],
    },
    {
      label: 'Sales',
      nav: [
        {
          title: 'Transaction',
          url: '/sales/transaction',
          icon: ReceiptIcon,
          isActive: false,
          items: [],
        },
      ],
    },
    {
      label: 'AR',
      nav: [
        {
          title: 'Invoice',
          url: '/ar/invoice',
          icon: FileTextIcon,
          isActive: false,
          items: [],
        },
      ],
    },
    // {
    //   label: 'Lead',
    //   nav: [
    //     {
    //       title: 'Lead Prospek',
    //       url: '/lead/prospek',
    //       icon: LandPlotIcon,
    //       isActive: false,
    //       items: [],
    //     },
    //   ],
    // },
    // {
    //   label: "Report",
    //   nav: [
    //     {
    //       title: "Monthly Sales",
    //       url: "/report/monthly-sales",
    //       icon: NewspaperIcon,
    //       isActive: false,
    //       items: [],
    //     },
    //   ],
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href='/'>
                <div className='text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600'>
                  <Image src='/logo.png' alt='logo' width={16} height={16} />
                </div>
                <div className='flex flex-col gap-0.5 leading-none'>
                  <span className='font-semibold'>Data Learning</span>
                  <span>Neelo</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {/* <SidebarHeader> */}
      {/* <div className="flex flex-row items-center px-2 pt-2 gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">Data Learning</span>
            <span className="">Neelo</span>
          </div>
        </div> */}
      {/* <VersionSwitcher
          versions={sidebarData.versions}
          defaultVersion={sidebarData.versions[0]}
        /> */}
      {/* </SidebarHeader> */}
      <SidebarContent>
        {sidebarData.groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.nav.map((item) =>
                item.items?.length > 0 ? (
                  // Item dengan submenu
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.isActive}
                    className='group/collapsible'
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {/* <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent> */}
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  // Item tanpa submenu
                  <SidebarMenuItem key={item.title}>
                    <Link href={item.url}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className={item.isActive ? 'active' : ''}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
