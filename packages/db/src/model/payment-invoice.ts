import { relations } from 'drizzle-orm';
import { decimal, integer, pgTable } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { invoices } from './invoice';
import { payments } from './payment';

export const paymentInvoices = pgTable('payment_invoices', {
  paymentId: integer().references(() => payments.id, {
    onDelete: 'cascade',
  }),
  invoiceId: integer().references(() => invoices.id, {
    onDelete: 'cascade',
  }),
  amountPaid: decimal({ precision: 10, scale: 2 }).notNull(),
  ...timestamps,
});

export const paymentInvoicesRelations = relations(
  paymentInvoices,
  ({ one }) => ({
    payment: one(payments, {
      fields: [paymentInvoices.paymentId],
      references: [payments.id],
    }),
    invoice: one(invoices, {
      fields: [paymentInvoices.invoiceId],
      references: [invoices.id],
    }),
  })
);
