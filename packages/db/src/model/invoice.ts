import {
  date,
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { customers } from './customer';

export const invouceStatusEnum = pgEnum('status', [
  'pending',
  'partially paid',
  'paid',
]);

export const invoices = pgTable('invoices', {
  id: serial().primaryKey(),
  invoiceNo: varchar({ length: 50 }).unique().notNull(),
  date: date('date').notNull(),
  customerId: integer().references(() => customers.id),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).default('0'),
  taxAmount: decimal('tax_amount', { precision: 15, scale: 2 }).default('0'),
  stampDuty: decimal('stamp_duty', { precision: 15, scale: 2 }).default('0'),
  grandTotal: decimal('grand_total', { precision: 15, scale: 2 }).default('0'),
  status: invouceStatusEnum().default('pending'),
  description: varchar({ length: 255 }),
  ...timestamps,
});
