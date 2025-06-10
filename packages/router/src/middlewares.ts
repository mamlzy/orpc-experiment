import { ORPCError, os } from '@orpc/server';

import { auth } from '@repo/auth/server';

import type { HonoContext } from './types';

export const authMiddleware = os
  .$context<{ c: HonoContext }>() // <-- define dependent-context
  .middleware(async ({ context: { c }, next }) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers!,
    });

    if (!session) {
      throw new ORPCError('UNAUTHORIZED');
    }

    // Execute logic before the handler
    const result = await next({
      context: {
        c,
        session,
      },
    });

    // Execute logic after the handler

    return result;
  });
