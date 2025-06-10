import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { companyTable } from '../model/company';

export const getAllCompanyQuerySchema = z
  .object({
    page: z.number().optional(),
    limit: z.number().optional(),
    name: z.string().optional(),
  })
  .optional();

export const createCompanySchema = createInsertSchema(companyTable, {
  companyName: z.string().min(2),
  logo: z.string().nullable(),
});

export const updateCompanySchema = createCompanySchema;

export type GetAllCompanyQuery = z.infer<typeof getAllCompanyQuerySchema>;
export type CreateCompanySchema = z.infer<typeof createCompanySchema>;
export type UpdateCompanySchema = z.infer<typeof updateCompanySchema>;
