import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

import { transactionItemTable } from '../model';

export const transactionItemsInsertSchema =
  createInsertSchema(transactionItemTable);
export const transactionItemsUpdateSchema =
  createUpdateSchema(transactionItemTable);
