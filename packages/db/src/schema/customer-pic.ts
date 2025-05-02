import { relations } from 'drizzle-orm';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { customers } from '../model/customer';
import { customersPics } from '../model/customer-pic';

export const customerPicRelations = relations(customersPics, ({ one }) => ({
  customer: one(customers, {
    fields: [customersPics.customerId],
    references: [customers.id],
  }),
}));

export const insertCustomerPicSchema = createInsertSchema(customersPics, {
  picName: z.string(),
  position: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable,
  address: z.string().optional().nullable(),
  customerId: z.number(),
});

export const updateCustomerPicSchema = createUpdateSchema(customersPics, {
  picName: z.string().min(3).optional(),
  position: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(3).optional(),
  address: z.string().min(3).optional(),
  customerId: z.number().optional(),
});

export type CustomerPicInput = z.infer<typeof insertCustomerPicSchema>;
export type CustomerPicUpdate = z.infer<typeof updateCustomerPicSchema>;
