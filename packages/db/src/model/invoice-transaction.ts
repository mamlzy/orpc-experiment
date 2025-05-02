import { integer, pgTable } from 'drizzle-orm/pg-core';

import { invoices } from './invoice';
import { transactions } from './transaction';

export const invoiceTransactions = pgTable('invoice_transactions', {
  invoiceId: integer()
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  transactionId: integer()
    .notNull()
    .references(() => transactions.id, { onDelete: 'cascade' }),
});
