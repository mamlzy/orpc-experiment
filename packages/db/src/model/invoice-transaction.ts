import { relations } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { invoiceTable } from './invoice';
import { transactionTable } from './transaction';

export const invoiceTransactionTable = pgTable('invoice_transactions', {
  invoiceId: varchar({ length: 255 })
    .notNull()
    .references(() => invoiceTable.id, { onDelete: 'cascade' }),
  transactionId: varchar({ length: 255 })
    .notNull()
    .references(() => transactionTable.id, { onDelete: 'cascade' }),
});

export const invoiceTransactionTableRelations = relations(
  invoiceTransactionTable,
  ({ one }) => ({
    invoice: one(invoiceTable, {
      fields: [invoiceTransactionTable.invoiceId],
      references: [invoiceTable.id],
    }),
    transaction: one(transactionTable, {
      fields: [invoiceTransactionTable.transactionId],
      references: [transactionTable.id],
    }),
  })
);
