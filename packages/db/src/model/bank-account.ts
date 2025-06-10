import { createId } from '@paralleldrive/cuid2';
import { boolean, pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';

export const bankAccountTable = pgTable('bank_accounts', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  bankName: varchar({ length: 255 }).notNull(),
  accountName: varchar({ length: 255 }).notNull(),
  accountNumber: varchar({ length: 255 }).notNull(),
  isActive: boolean().notNull().default(true),
  ...timestamps,
});
