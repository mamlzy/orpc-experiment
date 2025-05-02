import { relations } from 'drizzle-orm';
import { z } from 'zod';

import { customers } from '../model/customer';
import { invoices } from '../model/invoice';

export const invoicesRelations = relations(invoices, ({ one }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
}));

export const insertInvoiceSchema = z.object({
  date: z.string(),
  transactionIds: z.array(z.number().int().positive()).min(1),
  customerId: z.preprocess((val) => Number(val), z.number().int().positive()),
  description: z.string().optional(),
});
export const updateInvoiceSchema = z.object({
  date: z.string().optional(),
  transactionIds: z.array(z.number().int().positive()).optional(),
  customerId: z
    .preprocess((val) => Number(val), z.number().int().positive())
    .optional(),
  description: z.string().optional(),
});

export type InvoiceInput = z.infer<typeof insertInvoiceSchema>;
export type InvoiceUpdate = z.infer<typeof updateInvoiceSchema>;
