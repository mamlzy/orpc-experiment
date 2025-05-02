import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { services } from './service';

export const products = pgTable('products', {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  serviceId: integer().references(() => services.id),
  ...timestamps,
});

export const productsRelations = relations(products, ({ one }) => ({
  service: one(services, {
    fields: [products.serviceId],
    references: [services.id],
  }),
}));
