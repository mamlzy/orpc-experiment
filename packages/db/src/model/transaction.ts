import { relations } from 'drizzle-orm';
import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { customers } from './customer';
import { transactionItems } from './transaction-item';
import { users } from './user';

export const transactionStatusEnum = pgEnum('status', [
  'pending',
  'invoiced',
  'done',
  'canceled',
]);

export const transactions = pgTable('transactions', {
  id: serial().primaryKey(),
  marketingId: varchar({ length: 255 }).references(() => users.id),
  customerId: integer().references(() => customers.id),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).default('0'),
  stampDuty: decimal('stamp_duty', { precision: 15, scale: 2 }).default('0'),
  grandTotal: decimal('grand_total', { precision: 15, scale: 2 }).notNull(),
  status: transactionStatusEnum().default('pending'),
  ...timestamps,
});

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    marketing: one(users, {
      fields: [transactions.marketingId],
      references: [users.id],
    }),
    customer: one(customers, {
      fields: [transactions.customerId],
      references: [customers.id],
    }),
    items: many(transactionItems),
  })
);
