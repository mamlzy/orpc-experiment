import type { Context } from 'hono';

import type { auth } from '@repo/auth/server';

export type AuthContext = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};

export type HonoContext = Context<AuthContext>;
