import { Suspense } from 'react';

import { PageClient } from './page.client';

export const metadata = {
  title: 'Dashboard | Neelo',
};

export default function Page() {
  return (
    <Suspense>
      <PageClient />
    </Suspense>
  );
}
