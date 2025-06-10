import { relations } from 'drizzle-orm';
import { pgTable } from 'drizzle-orm/pg-core';

import { companyTable } from './company';
import { customerTable } from './customer';

export const userTable = pgTable('users', (t) => ({
  id: t.varchar({ length: 36 }).primaryKey(),
  name: t.text().notNull(),
  email: t.varchar({ length: 255 }).notNull().unique(),
  emailVerified: t.boolean().notNull(),
  image: t.text(),
  createdAt: t.timestamp().$defaultFn(() => new Date()),
  updatedAt: t.timestamp().$defaultFn(() => new Date()),
  username: t.varchar({ length: 255 }).unique(),
  displayUsername: t.text(),
  role: t.text(),
  banned: t.boolean(),
  banReason: t.text(),
  banExpires: t.timestamp(),

  //! additional fields
  photo: t.text(),
  companyId: t.varchar({ length: 255 }).references(() => companyTable.id),
  deletedAt: t.timestamp(),
}));

export type User = typeof userTable.$inferSelect;

export const userTableRelations = relations(userTable, ({ one, many }) => ({
  company: one(companyTable, {
    fields: [userTable.companyId],
    references: [companyTable.id],
  }),
  customers: many(customerTable),
}));
