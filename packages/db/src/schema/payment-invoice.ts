import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { paymentInvoiceTable } from '../model/payment-invoice';

export const insertPaymentInvoiceSchema =
  createInsertSchema(paymentInvoiceTable);
export const updatePaymentInvoiceSchema =
  createUpdateSchema(paymentInvoiceTable);

export type PaymentInvoiceInput = z.infer<typeof insertPaymentInvoiceSchema>;
export type PaymentInvoiceUpdate = z.infer<typeof updatePaymentInvoiceSchema>;
