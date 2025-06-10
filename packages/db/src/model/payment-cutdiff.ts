import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { invoiceTable } from './invoice';
import { paymentTable } from './payment';

export const paymentCutDiffs = pgTable('payment_cut_diffs', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  paymentId: varchar({ length: 255 }).references(() => invoiceTable.id),
  invoiceId: varchar({ length: 255 }).references(() => paymentTable.id),
  description: text(),
  ...timestamps,
});

export const paymentCutDiffsRelations = relations(
  paymentCutDiffs,
  ({ one }) => ({
    payment: one(invoiceTable, {
      fields: [paymentCutDiffs.paymentId],
      references: [invoiceTable.id],
    }),
    invoice: one(paymentTable, {
      fields: [paymentCutDiffs.invoiceId],
      references: [paymentTable.id],
    }),
  })
);
