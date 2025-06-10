import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { customerTable } from './customer';
import { productTable } from './product';

export const customerProductStatusEnum = pgEnum('customer_product_status', [
  'INITIAL_CONTACT',
  'DEEPENING',
  'QUOTATION_SENT',
  'FOLLOW_UP',
  'NEGOTIATION',
  'ON_HOLD',
  'SUCCESS',
  'FAILED',
  'DROPPED',
]);
export type CustomerProductStatus =
  (typeof customerProductStatusEnum.enumValues)[number];

export const customerProductTable = pgTable('customer_products', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  productId: varchar({ length: 255 }).references(() => productTable.id),
  description: text(),
  customerId: varchar({ length: 255 }).references(() => customerTable.id, {
    onDelete: 'cascade',
  }),
  status: customerProductStatusEnum('status'),
  ...timestamps,
});

export type CustomerProduct = typeof customerProductTable.$inferSelect;

export const customerProductTableRelations = relations(
  customerProductTable,
  ({ one }) => ({
    customer: one(customerTable, {
      fields: [customerProductTable.customerId],
      references: [customerTable.id],
    }),
    product: one(productTable, {
      fields: [customerProductTable.productId],
      references: [productTable.id],
    }),
  })
);
