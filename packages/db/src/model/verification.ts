import { pgTable } from 'drizzle-orm/pg-core';

export const verificationTable = pgTable('verifications', (t) => ({
  id: t.varchar({ length: 36 }).primaryKey(),
  identifier: t.text().notNull(),
  value: t.text().notNull(),
  expiresAt: t.timestamp().notNull(),
  createdAt: t.timestamp().$defaultFn(() => new Date()),
  updatedAt: t.timestamp().$defaultFn(() => new Date()),
}));
