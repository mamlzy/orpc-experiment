import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
  businessEntityEnum,
  customers,
  customerStatusEnum,
  customerTypeEnum,
} from '../model/customer';

const nullableString = z.string().nullable().optional();

export const insertCustomerSchema = createInsertSchema(customers, {
  businessEntity: z.enum(businessEntityEnum.enumValues),
  customerType: z.enum(customerTypeEnum.enumValues),
  name: z.string().min(3),
  pareto: nullableString,
  address: z.string().nullable().optional(),
  telephone: nullableString,
  email: z.string().nullable().optional(),
  website: nullableString,
  country: nullableString,
  sector: nullableString,
  latitude: nullableString,
  longitude: nullableString,
  logo: nullableString,
  companyId: z.preprocess((val) => Number(val), z.number().int().positive()),
  marketingId: nullableString,
  status: z.enum(customerStatusEnum.enumValues).default('Bank Data'),
});

export const updateCustomerSchema = createUpdateSchema(customers, {
  businessEntity: z.enum(businessEntityEnum.enumValues).optional(),
  customerType: z.enum(customerTypeEnum.enumValues).optional(),
  name: z.string().min(3).optional(),
  pareto: nullableString,
  address: z.string().min(3).optional(),
  telephone: nullableString,
  email: z.string().email().nullable().optional(),
  website: nullableString,
  country: nullableString,
  sector: nullableString,
  latitude: nullableString,
  longitude: nullableString,
  logo: nullableString,
  companyId: z
    .preprocess((val) => Number(val), z.number().int().positive())
    .optional(),
  marketingId: nullableString,
  status: z.enum(customerStatusEnum.enumValues).optional(),
});

export type CustomerInput = z.infer<typeof insertCustomerSchema>;
export type CustomerUpdate = z.infer<typeof updateCustomerSchema>;
