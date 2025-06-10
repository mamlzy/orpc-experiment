import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
// import { BatchLinkPlugin } from '@orpc/client/plugins';
import { createORPCReactQueryUtils } from '@orpc/react-query';
import type {
  InferRouterInputs,
  InferRouterOutputs,
  RouterClient,
} from '@orpc/server';

import type { router } from '@repo/router';

import { env } from '@/lib/env';

export const rpcLink = new RPCLink({
  url: new URL('/rpc', env.NEXT_PUBLIC_API_BASE_URL),
  headers: () => ({
    Authorization: 'Bearer default-token',
  }),
  fetch: (request, init) =>
    globalThis.fetch(request, {
      ...init,
      credentials: 'include',
    }),
  plugins: [
    // new BatchLinkPlugin({
    //   groups: [
    //     {
    //       condition: () => true,
    //       context: {},
    //     },
    //   ],
    // }),
  ],
});

export const orpcClient: RouterClient<typeof router> =
  createORPCClient(rpcLink);

export const orpc = createORPCReactQueryUtils(orpcClient);

export type Inputs = InferRouterInputs<typeof router>;
export type Outputs = InferRouterOutputs<typeof router>;
