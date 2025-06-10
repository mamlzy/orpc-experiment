import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { customerProductTable } from '../model/customer-product';

export const createCustomerProductSchema = createInsertSchema(
  customerProductTable,
  {
    description: (s) => s.nonempty(),
    customerId: (s) => s.nonempty(),
    productId: (s) => s.nonempty(),
  }
);

export const createCustomerProductsSchema = createCustomerProductSchema.array();

export const updateCustomerProductSchema = createUpdateSchema(
  customerProductTable,
  {
    description: (s) => s.nonempty(),
    customerId: (s) => s.nonempty(),
  }
);

export const manageCustomerProductsSchema = z.object({
  customerId: z.string().nonempty(),
  deepeningProductIds: z.array(z.string()),
  successProductIds: z.array(z.string()),
});

export type CreateCustomerProductSchema = z.infer<
  typeof createCustomerProductSchema
>;
export type UpdateCustomerProductSchema = z.infer<
  typeof updateCustomerProductSchema
>;
export type ManageCustomerProductsSchema = z.infer<
  typeof manageCustomerProductsSchema
>;
