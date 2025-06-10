import { z } from 'zod';

import {
  customerBusinessEntityEnum,
  customerStatusEnum,
  customerTypeEnum,
} from '../model/customer';

export const createCustomerSchema = z.strictObject({
  businessEntity: z.enum(customerBusinessEntityEnum.enumValues),
  customerType: z.enum(customerTypeEnum.enumValues),
  name: z.string().trim().min(3),
  pareto: z.string().trim().optional(),
  address: z.string().trim().optional(),
  telephone: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  website: z.string().trim().optional(),
  country: z.string().trim().optional(),
  sector: z.string().trim().optional(),
  latitude: z.string().trim().optional(),
  longitude: z.string().trim().optional(),
  logo: z.string().trim().optional(),
  companyId: z.string().trim().nonempty(),
  marketingId: z.string().trim().nullable(),
  status: z.enum(customerStatusEnum.enumValues).default('BANK_DATA'),
  description: z.string().trim().optional(),
});

export const createCustomersSchema = createCustomerSchema.array();

export const updateCustomerSchema = createCustomerSchema;

export type CreateCustomerSchema = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerSchema = z.infer<typeof updateCustomerSchema>;
