import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { BatchLinkPlugin } from '@orpc/client/plugins';
import { createORPCReactQueryUtils } from '@orpc/react-query';
import type { RouterClient } from '@orpc/server';

import type { router } from '@repo/router';

import { env } from '@/lib/env';

const rpcLink = new RPCLink({
  url: new URL('/api', env.NEXT_PUBLIC_API_BASE_URL),
  headers: () => ({
    Authorization: 'Bearer default-token',
  }),
  plugins: [
    new BatchLinkPlugin({
      groups: [
        {
          condition: () => true,
          context: {},
        },
      ],
    }),
  ],
});

export const orpcClient: RouterClient<typeof router> =
  createORPCClient(rpcLink);

export const orpc = createORPCReactQueryUtils(orpcClient);
