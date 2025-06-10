import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { customerTable } from './customer';

export const customerPicTable = pgTable('customer_pics', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  picName: varchar({ length: 255 }).notNull(),
  position: varchar({ length: 255 }),
  email: varchar({ length: 255 }),
  phone: varchar({ length: 255 }),
  address: text(),
  customerId: varchar({ length: 255 }).references(() => customerTable.id, {
    onDelete: 'cascade',
  }),
  ...timestamps,
});

export const customersPicTableRelations = relations(
  customerPicTable,
  ({ one }) => ({
    customer: one(customerTable, {
      fields: [customerPicTable.customerId],
      references: [customerTable.id],
    }),
  })
);
