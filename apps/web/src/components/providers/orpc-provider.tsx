'use client';

import { useState } from 'react';
import { ORPCContext } from '@/context/orpc-context';
import { createORPCClient } from '@orpc/client';
import { createORPCReactQueryUtils } from '@orpc/react-query';
import type { RouterClient } from '@orpc/server';

import type { router } from '@repo/router';

import { rpcLink } from '@/lib/orpc';

export function ORPCProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState<RouterClient<typeof router>>(() =>
    createORPCClient(rpcLink)
  );
  const [orpc] = useState(() => createORPCReactQueryUtils(client));

  return <ORPCContext.Provider value={orpc}>{children}</ORPCContext.Provider>;
}
