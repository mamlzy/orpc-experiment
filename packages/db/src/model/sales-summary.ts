import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { decimal, integer, pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { companyTable } from './company';

export const salesSummaryTable = pgTable('sales_summaries', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  january: decimal().default('0'),
  february: decimal().default('0'),
  march: decimal().default('0'),
  april: decimal().default('0'),
  may: decimal().default('0'),
  june: decimal().default('0'),
  july: decimal().default('0'),
  august: decimal().default('0'),
  september: decimal().default('0'),
  october: decimal().default('0'),
  november: decimal().default('0'),
  december: decimal().default('0'),
  year: integer().notNull(),
  companyId: varchar({ length: 255 }).references(() => companyTable.id),
  ...timestamps,
});

export const salesSummaryTableRelations = relations(
  salesSummaryTable,
  ({ one }) => ({
    company: one(companyTable, {
      fields: [salesSummaryTable.companyId],
      references: [companyTable.id],
    }),
  })
);
