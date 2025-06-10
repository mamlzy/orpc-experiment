import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  varchar,
} from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { productTable } from './product';
import { transactionTable } from './transaction';

export const transactionItemStatusEnum = pgEnum('transaction_item_status', [
  'PENDING',
  'ONHOLD',
  'ON_PROCESS',
  'PARTIALLY_PAID',
  'PAID',
  'CANCELED',
]);

export const transactionItemTable = pgTable('transaction_items', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  transactionId: varchar({ length: 255 })
    .notNull()
    .references(() => transactionTable.id, {
      onDelete: 'cascade',
    }),
  productId: varchar({ length: 255 })
    .notNull()
    .references(() => productTable.id),
  qty: integer().notNull(),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  status: transactionItemStatusEnum('status'),
  ...timestamps,
});

export const transactionItemTableRelations = relations(
  transactionItemTable,
  ({ one }) => ({
    transaction: one(transactionTable, {
      fields: [transactionItemTable.transactionId],
      references: [transactionTable.id],
    }),
    product: one(productTable, {
      fields: [transactionItemTable.productId],
      references: [productTable.id],
    }),
  })
);
