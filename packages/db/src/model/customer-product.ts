import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { customers } from './customer';

export const customersProducts = pgTable('customer_products', {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  customerId: integer().references(() => customers.id, {
    onDelete: 'cascade',
  }),
  ...timestamps,
});

export const customerProductRelations = relations(
  customersProducts,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customersProducts.customerId],
      references: [customers.id],
    }),
  })
);
