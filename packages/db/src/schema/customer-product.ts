import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { customersProducts } from '../model/customer-product';

export const insertCustomerProductSchema = createInsertSchema(
  customersProducts,
  {
    name: z.string().min(3),
    description: z.string().min(3).optional(),
    customerId: z.number(),
  }
);

export const updateCustomerProductSchema = createUpdateSchema(
  customersProducts,
  {
    name: z.string().min(3).optional(),
    description: z.string().min(3).optional(),
    customerId: z.number().optional(),
  }
);

export type CustomerProductInput = z.infer<typeof insertCustomerProductSchema>;
export type CustomerProductUpdate = z.infer<typeof updateCustomerProductSchema>;
