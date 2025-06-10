import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { invoiceTransactionTable } from '../model/invoice-transaction';

export const insertInvoiceTransactionSchema = createInsertSchema(
  invoiceTransactionTable
);
export const updateInvoiceTransactionSchema = createUpdateSchema(
  invoiceTransactionTable
);

export type InvoiceTransactionInput = z.infer<
  typeof insertInvoiceTransactionSchema
>;
export type InvoiceTransactionUpdate = z.infer<
  typeof updateInvoiceTransactionSchema
>;
