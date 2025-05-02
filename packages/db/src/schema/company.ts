import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { companies } from '../model/company';

const nullableString = z.string().nullable().optional();

export const insertCompanySchema = createInsertSchema(companies, {
  companyName: z.string().min(2),
  logo: nullableString,
});

export const updateCompanySchema = createUpdateSchema(companies, {
  companyName: z.string().optional(),
  logo: nullableString,
});

export type CompanyInput = z.infer<typeof insertCompanySchema>;
export type CompanyUpdate = z.infer<typeof updateCompanySchema>;
