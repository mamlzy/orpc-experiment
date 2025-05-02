import { integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { customers } from './customer';

export const customersPics = pgTable('customer_pics', {
  id: serial().primaryKey(),
  picName: varchar({ length: 255 }).notNull(),
  position: varchar({ length: 255 }),
  email: varchar({ length: 255 }),
  phone: varchar({ length: 255 }),
  address: text(),
  customerId: integer().references(() => customers.id, {
    onDelete: 'cascade',
  }),
  ...timestamps,
});
