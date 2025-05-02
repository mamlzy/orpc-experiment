import { relations } from 'drizzle-orm';
import { pgTable } from 'drizzle-orm/pg-core';

import { users } from './user';

export const sessions = pgTable('sessions', (t) => ({
  id: t.varchar({ length: 36 }).primaryKey(),
  expiresAt: t.timestamp().notNull(),
  token: t.varchar({ length: 255 }).notNull().unique(),
  createdAt: t.timestamp().notNull(),
  updatedAt: t.timestamp().notNull(),
  ipAddress: t.text(),
  userAgent: t.text(),
  userId: t
    .varchar({ length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
