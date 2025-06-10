import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { customerTable } from './customer';
import { userTable } from './user';

export const companyTable = pgTable('companies', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  companyName: varchar({ length: 255 }).notNull(),
  logo: varchar({ length: 255 }),
  ...timestamps,
});

export const companyTableRelations = relations(companyTable, ({ many }) => ({
  customers: many(customerTable),
  users: many(userTable),
}));
