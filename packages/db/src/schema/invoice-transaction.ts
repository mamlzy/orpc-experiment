import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { invoiceTransactions } from '../model/invoice-transaction';

export const insertInvoiceTransactionSchema =
  createInsertSchema(invoiceTransactions);
export const updateInvoiceTransactionSchema =
  createUpdateSchema(invoiceTransactions);

export type InvoiceTransactionInput = z.infer<
  typeof insertInvoiceTransactionSchema
>;
export type InvoiceTransactionUpdate = z.infer<
  typeof updateInvoiceTransactionSchema
>;
