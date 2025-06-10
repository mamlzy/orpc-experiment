import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { decimal, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { customerTable } from './customer';
import { transactionItemTable } from './transaction-item';
import { userTable } from './user';

export const transactionStatusEnum = pgEnum('transaction_status', [
  'PENDING',
  'PARTIALLY_INVOICED',
  'FULLY_INVOICED',
  'DONE',
  'CANCELED',
]);

export const transactionTable = pgTable('transactions', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  marketingId: varchar({ length: 255 })
    .notNull()
    .references(() => userTable.id, {
      onUpdate: 'cascade',
    }),
  customerId: varchar({ length: 255 })
    .notNull()
    .references(() => customerTable.id),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).default('0'),
  stampDuty: decimal('stamp_duty', { precision: 15, scale: 2 }).default('0'),
  grandTotal: decimal('grand_total', { precision: 15, scale: 2 }).notNull(),
  status: transactionStatusEnum().default('PENDING'),
  ...timestamps,
});

export const transactionTableRelations = relations(
  transactionTable,
  ({ one, many }) => ({
    marketing: one(userTable, {
      fields: [transactionTable.marketingId],
      references: [userTable.id],
    }),
    customer: one(customerTable, {
      fields: [transactionTable.customerId],
      references: [customerTable.id],
    }),
    items: many(transactionItemTable),
  })
);
