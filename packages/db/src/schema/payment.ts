import { z } from 'zod';

import { paymentMethodEnum } from '../model/payment';

export const insertPaymentSchema = z.object({
  date: z.string(),
  customerId: z.preprocess((val) => Number(val), z.number().int().positive()),
  paymentMethod: z.enum(paymentMethodEnum.enumValues),
  totalPaid: z.number(),
  items: z.array(
    z.object({
      invoiceId: z.number(),
      amountPaid: z.number(),
    })
  ),
});
export const updatePaymentSchema = z.object({
  date: z.string().optional(),
  customerId: z
    .preprocess((val) => Number(val), z.number().int().positive())
    .optional(),
  paymentMethod: z.enum(paymentMethodEnum.enumValues).optional(),
  totalPaid: z.number().optional(),
  items: z
    .array(
      z.object({
        invoiceId: z.number(),
        amountPaid: z.number(),
      })
    )
    .optional(),
});

export type PaymentInput = z.infer<typeof insertPaymentSchema>;
export type PaymentUpdate = z.infer<typeof updatePaymentSchema>;
