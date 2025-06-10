import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { productTable } from './product';

export const serviceTable = pgTable('services', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  ...timestamps,
});

export const serviceTableRelations = relations(serviceTable, ({ many }) => ({
  product: many(productTable),
}));
