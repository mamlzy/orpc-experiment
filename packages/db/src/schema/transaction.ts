import { z } from 'zod';

import { transactionStatusEnum } from '../model';

export const createTransactionSchema = z.strictObject({
  marketingId: z.string(),
  customerId: z.string(),
  taxAmount: z.number().optional(),
  stampDuty: z.number().optional(),
  items: z.array(
    z.strictObject({
      productId: z.string(),
      qty: z.number().positive(),
      price: z.number().positive(),
    })
  ),
});

export const createTransactionsSchema = createTransactionSchema.array();

export const updateTransactionSchema = z.object({
  marketingId: z.string().optional(),
  customerId: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        productId: z.string(),
        qty: z.number(),
        price: z.number(),
      })
    )
    .optional(),
});

export const getTransactionsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  transactionId: z.string().optional(),
  marketingId: z.string().optional(),
  customerId: z.string().optional(),
  status: z.array(z.enum(transactionStatusEnum.enumValues)).optional(),
});

export const getTransactionByIdQuerySchema = z.object({
  id: z.string().trim().nonempty(),
  status: z.enum(transactionStatusEnum.enumValues).optional(),
});

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;
export type CreateTransactionsSchema = z.infer<typeof createTransactionsSchema>;
export type UpdateTransactionSchema = z.infer<typeof updateTransactionSchema>;
export type GetTransactionByIdQuerySchema = z.infer<
  typeof getTransactionByIdQuerySchema
>;
export type GetTransactionsQuery = z.infer<typeof getTransactionsQuerySchema>;
