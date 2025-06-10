import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { productTable } from '../model/product';

export const createProductSchema = createInsertSchema(productTable, {
  name: (s) => s.nonempty(),
  description: (s) => s.nonempty(),
  serviceId: (s) => s.nonempty(),
});

export const createProductsSchema = createProductSchema.array();

export const updateProductSchema = createProductSchema;

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type CreateProductsSchema = z.infer<typeof createProductsSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
