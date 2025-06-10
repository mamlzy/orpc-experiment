import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { date, decimal, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { bankAccountTable } from './bank-account';
import { customerTable } from './customer';
import { transactionTable } from './transaction';

export const invoiceTypeEnum = pgEnum('invoice_type', [
  'DOWN_PAYMENT',
  'PARTIAL_PAYMENT',
  'FINAL_PAYMENT',
  'FULL_PAYMENT',
]);
export type InvoiceTypeEnum = (typeof invoiceTypeEnum.enumValues)[number];

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'UNPAID',
  'PARTIALLY_PAID',
  'PAID',
]);
export type InvoiceStatusEnum = (typeof invoiceStatusEnum.enumValues)[number];

export const invoiceTable = pgTable('invoices', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  invoiceNo: varchar({ length: 50 }).unique().notNull(),
  date: date('date').notNull(),
  dueDate: date('due_date').notNull(),
  customerId: varchar({ length: 255 }).references(() => customerTable.id),
  transactionId: varchar({ length: 255 }).references(() => transactionTable.id),
  type: invoiceTypeEnum('type').notNull(),
  percentage: decimal('percentage', { precision: 15, scale: 2 }).default('0'),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).default('0'),
  dpp: decimal('dpp', { precision: 15, scale: 2 }).default('0'),
  taxRate: decimal('tax_rate', { precision: 15, scale: 2 }).default('0'),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).default('0'),
  stampDuty: decimal('stamp_duty', { precision: 15, scale: 2 }).default('0'),
  grandTotal: decimal('grand_total', { precision: 15, scale: 2 }).default('0'),
  bankId: varchar({ length: 255 }).references(() => bankAccountTable.id),
  status: invoiceStatusEnum('status').notNull(),
  description: varchar({ length: 255 }),
  ...timestamps,
});

export const invoiceTableRelations = relations(invoiceTable, ({ one }) => ({
  customer: one(customerTable, {
    fields: [invoiceTable.customerId],
    references: [customerTable.id],
  }),
  transaction: one(transactionTable, {
    fields: [invoiceTable.transactionId],
    references: [transactionTable.id],
  }),
  bankAccount: one(bankAccountTable, {
    fields: [invoiceTable.bankId],
    references: [bankAccountTable.id],
  }),
}));
