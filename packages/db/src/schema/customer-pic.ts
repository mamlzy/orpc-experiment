import { z } from 'zod';

export const createCustomerPicSchema = z.object({
  picName: z.string().trim().nonempty(),
  position: z.string().trim().optional(),
  email: z.string().trim().email().or(z.literal('')).optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  customerId: z.string().trim().optional(),
});

export const updateCustomerPicSchema = createCustomerPicSchema;

export const getCustomerPicsSchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
  customerId: z.string().trim().optional(),
  picName: z.string().trim().optional(),
});

export type CreateCustomerPicSchema = z.infer<typeof createCustomerPicSchema>;
export type UpdateCustomerPicSchema = z.infer<typeof updateCustomerPicSchema>;
export type GetCustomerPicsSchema = z.infer<typeof getCustomerPicsSchema>;
