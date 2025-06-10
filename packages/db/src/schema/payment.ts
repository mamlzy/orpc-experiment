import { z } from 'zod';

import { paymentMethodEnum } from '../model/payment';

export const insertPaymentSchema = z.object({
  date: z.string(),
  customerId: z.string(),
  paymentMethod: z.enum(paymentMethodEnum.enumValues),
  bankAccount: z.string().optional(),
  bankNumber: z.string().optional(),
  totalPaid: z.number(),
  items: z.array(
    z.object({
      invoiceId: z.string(),
      amountPaid: z.number(),
    })
  ),
});

export const insertPaymentsSchema = insertPaymentSchema
  .extend({
    paymentNumber: z.string(),
  })
  .array();

export const updatePaymentSchema = z.object({
  date: z.string().optional(),
  customerId: z.string().optional(),
  paymentMethod: z.enum(paymentMethodEnum.enumValues).optional(),
  bankAccount: z.string().optional(),
  bankNumber: z.string().optional(),
  totalPaid: z.number().optional(),
  items: z
    .array(
      z.object({
        invoiceId: z.string(),
        amountPaid: z.number(),
      })
    )
    .optional(),
});

export type PaymentInput = z.infer<typeof insertPaymentSchema>;
export type PaymentUpdate = z.infer<typeof updatePaymentSchema>;
