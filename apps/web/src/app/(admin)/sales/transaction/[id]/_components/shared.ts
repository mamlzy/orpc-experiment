import { z } from 'zod';

import { createTransactionSchema } from '@repo/db/schema';

export const createItemSchema =
  createTransactionSchema.shape.items.element.extend({
    productName: z.string(),
  });

export type CreateItemSchema = z.infer<typeof createItemSchema>;
