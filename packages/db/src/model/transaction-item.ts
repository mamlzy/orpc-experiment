import { relations } from 'drizzle-orm';
import { decimal, integer, pgEnum, pgTable, serial } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { products } from './product';
import { transactions } from './transaction';

export const transactionItemStatusEnum = pgEnum('status', [
  'pending',
  'onhold',
  'on process',
  'partially paid',
  'paid',
  'canceled',
]);

export const transactionItems = pgTable('transaction_items', {
  id: serial().primaryKey(),
  transactionsId: integer().references(() => transactions.id, {
    onDelete: 'cascade',
  }),
  productId: integer().references(() => products.id),
  qty: integer().notNull(),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  status: transactionItemStatusEnum(),
  ...timestamps,
});

export const transactionItemsRelations = relations(
  transactionItems,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionItems.transactionsId],
      references: [transactions.id],
    }),
    product: one(products, {
      fields: [transactionItems.productId],
      references: [products.id],
    }),
  })
);
