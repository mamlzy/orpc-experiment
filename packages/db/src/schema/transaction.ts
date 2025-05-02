import { z } from 'zod';

export const insertTransactionSchema = z.object({
  marketingId: z.string(),
  customerId: z.preprocess((val) => Number(val), z.number().int().positive()),
  taxAmount: z.number().optional(),
  stampDuty: z.number().optional(),
  items: z.array(
    z.object({
      productId: z.number(),
      qty: z.number(),
      price: z.number(),
    })
  ),
});
export const updateTransactionSchema = z.object({
  marketingId: z.string().optional(),
  customerId: z
    .preprocess((val) => Number(val), z.number().int().positive())
    .optional(),
  items: z
    .array(
      z.object({
        id: z.number().optional(),
        productId: z.number(),
        qty: z.number(),
        price: z.number(),
      })
    )
    .optional(),
});

export type TransactionInput = z.infer<typeof insertTransactionSchema>;
export type TransactionUpdate = z.infer<typeof updateTransactionSchema>;
