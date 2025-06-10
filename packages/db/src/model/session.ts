import { relations } from 'drizzle-orm';
import { pgTable } from 'drizzle-orm/pg-core';

import { userTable } from './user';

export const sessionTable = pgTable('sessions', (t) => ({
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
    .references(() => userTable.id, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
  impersonatedBy: t.text(),
}));

export const sessionTableRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));
