import { relations } from 'drizzle-orm';
import { decimal, pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { invoiceTable } from './invoice';
import { paymentTable } from './payment';

export const paymentInvoiceTable = pgTable('payment_invoices', {
  paymentId: varchar({ length: 255 }).references(() => paymentTable.id, {
    onDelete: 'cascade',
  }),
  invoiceId: varchar({ length: 255 }).references(() => invoiceTable.id, {
    onDelete: 'cascade',
  }),
  amountPaid: decimal({ precision: 10, scale: 2 }).notNull(),
  ...timestamps,
});

export const paymentInvoiceTableRelations = relations(
  paymentInvoiceTable,
  ({ one }) => ({
    payment: one(paymentTable, {
      fields: [paymentInvoiceTable.paymentId],
      references: [paymentTable.id],
    }),
    invoice: one(invoiceTable, {
      fields: [paymentInvoiceTable.invoiceId],
      references: [invoiceTable.id],
    }),
  })
);
