import { MenuToggle } from '@/components/ui/menu-toggle';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AppSidebar } from '@/components/app-sidebar';

export const metadata = {
  title: 'Datalearning | Neelo',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='bg-background sticky top-0 z-[2] border-b p-4'>
          <div className='container mx-auto flex items-center justify-between gap-2'>
            {/* Left Section (Breadcrumb & Sidebar Trigger) */}
            <div className='flex items-center gap-2'>
              <SidebarTrigger className='-ml-1' />
              <Separator orientation='vertical' className='mr-2 h-4' />
            </div>
            <div className='flex items-center gap-2'>
              <ThemeToggle />
              <MenuToggle />
            </div>
          </div>
        </header>

        <div className='flex flex-1 flex-col gap-4 p-4'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
