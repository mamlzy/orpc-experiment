import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { customers } from './customer';
import { users } from './user';

export const companies = pgTable('companies', {
  id: serial().primaryKey(),
  companyName: varchar({ length: 255 }).notNull(),
  logo: varchar({ length: 255 }),
  ...timestamps,
});

export const companiesRelations = relations(companies, ({ many }) => ({
  customers: many(customers),
  users: many(users),
}));
