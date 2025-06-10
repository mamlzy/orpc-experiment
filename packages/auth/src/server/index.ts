import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, username } from 'better-auth/plugins';

import { db } from '@repo/db';
import {
  accountTable,
  sessionTable,
  userTable,
  verificationTable,
} from '@repo/db/model';
import { adminUserIds } from '@repo/shared';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: userTable,
      session: sessionTable,
      account: accountTable,
      verification: verificationTable,
    },
  }),
  user: {
    additionalFields: {
      companyId: {
        type: 'string',
        nullable: true,
      },
      photo: {
        type: 'string',
        nullable: true,
      },
      role: {
        type: 'string',
        nullable: false,
      },
      deletedAt: {
        type: 'date',
        nullable: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username(),
    admin({
      adminUserIds,
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 1,
  },
  advanced: {
    defaultCookieAttributes: {
      domain: process.env.DOMAIN,
    },
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_WEB_BASE_URL!],
});
