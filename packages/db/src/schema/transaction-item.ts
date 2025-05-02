import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

import { transactionItems } from '../model';

export const transactionItemsInsertSchema =
  createInsertSchema(transactionItems);
export const transactionItemsUpdateSchema =
  createUpdateSchema(transactionItems);
