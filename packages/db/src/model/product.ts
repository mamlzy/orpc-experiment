import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { serviceTable } from './service';

export const productTable = pgTable('products', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  serviceId: varchar({ length: 255 }).references(() => serviceTable.id),
  ...timestamps,
});

export type Product = typeof productTable.$inferSelect;

export const productTableRelations = relations(productTable, ({ one }) => ({
  service: one(serviceTable, {
    fields: [productTable.serviceId],
    references: [serviceTable.id],
  }),
}));
