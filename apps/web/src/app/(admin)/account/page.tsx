import { Suspense } from 'react';

import { PageClient } from './page.client';

export default function Page() {
  return (
    <Suspense>
      <PageClient />
    </Suspense>
  );
}
