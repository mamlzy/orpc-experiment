import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';

import { db } from '@repo/db';
import { accounts, sessions, users, verifications } from '@repo/db/model';

export const auth = betterAuth({
  session: {
    expiresIn: 60 * 60 * 24 * 1,
  },
  ...(process.env.NODE_ENV === 'production' && {
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domain: process.env.DOMAIN,
      },
      defaultCookieAttributes: {
        sameSite: 'none',
        secure: true,
        partitioned: true,
      },
    },
  }),
  database: drizzleAdapter(db, {
    provider: 'mysql',
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username()],
  trustedOrigins: [process.env.NEXT_PUBLIC_WEB_BASE_URL!],
});
