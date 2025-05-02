import { relations } from 'drizzle-orm';
import {
  date,
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { customers } from './customer';

export const paymentMethodEnum = pgEnum('payment_methods', [
  'Bank Transfer',
  'Cash',
  'Cheque',
  'Credit Card',
]);

export const payments = pgTable('payments', {
  id: serial().primaryKey(),
  paymentNumber: varchar({ length: 50 }).unique().notNull(),
  date: date('date').notNull(),
  customerId: integer().references(() => customers.id),
  paymentMethod: paymentMethodEnum().notNull(),
  totalPaid: decimal({ precision: 10, scale: 2 }).notNull(),
  ...timestamps,
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  customer: one(customers, {
    fields: [payments.customerId],
    references: [customers.id],
  }),
}));
