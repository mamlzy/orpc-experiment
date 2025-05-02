import { z } from 'zod';

export const insertPaymentInvoiceSchema = z.object({
  paymentId: z.preprocess((val) => Number(val), z.number().int().positive()),
  invoiceId: z.preprocess((val) => Number(val), z.number().int().positive()),
  amountPaid: z.number(),
});
export const updatePaymentInvoiceSchema = z.object({
  paymentId: z
    .preprocess((val) => Number(val), z.number().int().positive())
    .optional(),
  invoiceId: z
    .preprocess((val) => Number(val), z.number().int().positive())
    .optional(),
  amountPaid: z.number().optional(),
});

export type PaymentInvoiceInput = z.infer<typeof insertPaymentInvoiceSchema>;
export type PaymentInvoiceUpdate = z.infer<typeof updatePaymentInvoiceSchema>;
