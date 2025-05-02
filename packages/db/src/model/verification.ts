import { pgTable } from 'drizzle-orm/pg-core';

export const verifications = pgTable('verifications', (t) => ({
  id: t.varchar({ length: 36 }).primaryKey(),
  identifier: t.text().notNull(),
  value: t.text().notNull(),
  expiresAt: t.timestamp().notNull(),
  createdAt: t.timestamp(),
  updatedAt: t.timestamp(),
}));
