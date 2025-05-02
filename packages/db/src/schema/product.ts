import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { products } from '../model/product';

export const insertProductSchema = createInsertSchema(products, {
  name: z.string(),
  description: z.string(),
  serviceId: z.preprocess((val) => Number(val), z.number().int().positive()),
});
export const updateProductSchema = createUpdateSchema(products, {
  name: z.string().optional(),
  description: z.string().optional(),
  serviceId: z
    .preprocess((val) => Number(val), z.number().int().positive())
    .optional(),
});

export type ProductInput = z.infer<typeof insertProductSchema>;
export type ProductUpdate = z.infer<typeof updateProductSchema>;
