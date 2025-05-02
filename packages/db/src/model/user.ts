import { relations } from 'drizzle-orm';
import { integer, pgTable } from 'drizzle-orm/pg-core';

import { companies } from './company';
import { customers } from './customer';

export const users = pgTable('users', (t) => ({
  id: t.varchar({ length: 36 }).primaryKey(),
  name: t.text().notNull(),
  email: t.varchar({ length: 255 }).notNull().unique(),
  emailVerified: t.boolean().notNull(),
  image: t.text(),
  createdAt: t.timestamp().notNull(),
  updatedAt: t.timestamp().notNull(),
  username: t.varchar({ length: 255 }).unique(),

  //! additional
  photo: t.text(),
  companyId: integer().references(() => companies.id),
  deletedAt: t.timestamp(),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  customers: many(customers),
}));
