import { relations } from 'drizzle-orm';
import { decimal, integer, pgTable, serial } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { companies } from './company';

export const salesSummaries = pgTable('sales_summaries', {
  id: serial().primaryKey(),
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
  companyId: integer().references(() => companies.id),
  ...timestamps,
});

export const salesSummariesRelations = relations(salesSummaries, ({ one }) => ({
  company: one(companies, {
    fields: [salesSummaries.companyId],
    references: [companies.id],
  }),
}));
