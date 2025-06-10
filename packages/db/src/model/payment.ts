import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { date, decimal, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { customerTable } from './customer';

export const paymentMethodEnum = pgEnum('payment_methods', [
  'BANK_TRANSFER',
  'CASH',
  'CHEQUE',
  'CREDIT_CARD',
]);

export const paymentTable = pgTable('payments', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  paymentNumber: varchar({ length: 50 }).unique().notNull(),
  date: date('date').notNull(),
  customerId: varchar({ length: 255 }).references(() => customerTable.id),
  paymentMethod: paymentMethodEnum().notNull(),
  bankAccount: varchar({ length: 255 }),
  bankNumber: varchar({ length: 255 }),
  totalPaid: decimal({ precision: 10, scale: 2 }).notNull(),
  ...timestamps,
});

export const paymentTableRelations = relations(paymentTable, ({ one }) => ({
  customer: one(customerTable, {
    fields: [paymentTable.customerId],
    references: [customerTable.id],
  }),
}));
