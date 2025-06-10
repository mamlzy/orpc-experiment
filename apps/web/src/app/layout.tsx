import './globals.css';

import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { geistMono, geistSans } from '@/lib/fonts';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { ORPCProvider } from '@/components/providers/orpc-provider';
import { ReactQueryProvider } from '@/components/providers/react-query-provider';

export const metadata: Metadata = {
  title: 'Datalearning',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <ORPCProvider>
              <NuqsAdapter>
                {children}

                <Toaster />
                <SonnerToaster
                  richColors
                  position='top-right'
                  offset={15}
                  closeButton
                />
              </NuqsAdapter>
            </ORPCProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
