import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { salesSummaries } from '../model';

const optionalFloatData = z
  .preprocess((val) => Number(val), z.number().int().positive())
  .nullable()
  .optional();

export const insertSalesSummarySchema = createInsertSchema(salesSummaries, {
  january: optionalFloatData,
  february: optionalFloatData,
  march: optionalFloatData,
  april: optionalFloatData,
  may: optionalFloatData,
  june: optionalFloatData,
  july: optionalFloatData,
  august: optionalFloatData,
  september: optionalFloatData,
  october: optionalFloatData,
  november: optionalFloatData,
  december: optionalFloatData,
  year: z.number().int().positive(),
  companyId: z.preprocess((val) => Number(val), z.number().int().positive()),
});

export const updateSalesSummarySchema = createUpdateSchema(salesSummaries, {
  january: optionalFloatData,
  february: optionalFloatData,
  march: optionalFloatData,
  april: optionalFloatData,
  may: optionalFloatData,
  june: optionalFloatData,
  july: optionalFloatData,
  august: optionalFloatData,
  september: optionalFloatData,
  october: optionalFloatData,
  november: optionalFloatData,
  december: optionalFloatData,
  year: z.number().int().positive().optional(),
  companyId: z
    .preprocess((val) => Number(val), z.number().int().positive())
    .optional(),
});

export type SalesSummaryInput = z.infer<typeof insertSalesSummarySchema>;
export type SalesSummaryUpdate = z.infer<typeof updateSalesSummarySchema>;
