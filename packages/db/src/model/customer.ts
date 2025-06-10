import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { companyTable } from './company';
import { customerPicTable } from './customer-pic';
import { customerProductTable } from './customer-product';
import { userTable } from './user';

export const customerBusinessEntityEnum = pgEnum('business_entity', [
  'PT',
  'CV',
  'UD',
  'FIRM',
  'KOPERASI',
  'YAYASAN',
  'PERORANGAN',
  'BUMN',
  'BUMS',
  'BUPD',
  'LAINNYA',
]);
export type CustomerBusinessEntityEnum =
  (typeof customerBusinessEntityEnum.enumValues)[number];

export const customerTypeEnum = pgEnum('customer_type', [
  'INTERNATIONAL',
  'DOMESTIC',
]);
export type CustomerTypeEnum = (typeof customerTypeEnum.enumValues)[number];

export const customerStatusEnum = pgEnum('customer_status', [
  'ACTIVE',
  'INACTIVE',
  'BANK_DATA',
]);
export type CustomerStatusEnum = (typeof customerStatusEnum.enumValues)[number];

export const customerTable = pgTable('customers', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  businessEntity: customerBusinessEntityEnum().notNull(),
  customerType: customerTypeEnum().notNull().default('INTERNATIONAL'),
  name: varchar({ length: 255 }).notNull(),
  pareto: varchar({ length: 255 }),
  address: text(),
  telephone: varchar({ length: 255 }),
  email: varchar({ length: 255 }),
  website: varchar({ length: 255 }),
  country: varchar({ length: 255 }),
  sector: varchar({ length: 255 }),
  productsCategory: varchar({ length: 255 }),
  productsDescription: varchar({ length: 255 }),
  needs: varchar({ length: 255 }),
  category: varchar({ length: 255 }),
  latitude: text(),
  longitude: text(),
  logo: varchar({ length: 255 }),
  marketingId: varchar({ length: 255 }).references(() => userTable.id, {
    onUpdate: 'cascade',
  }),
  companyId: varchar({ length: 255 }).references(() => companyTable.id),
  status: customerStatusEnum('status'),
  description: text(),
  ...timestamps,
});

export type Customer = typeof customerTable.$inferSelect;

export const customerTableRelations = relations(
  customerTable,
  ({ one, many }) => ({
    company: one(companyTable, {
      fields: [customerTable.companyId],
      references: [companyTable.id],
    }),
    marketing: one(userTable, {
      fields: [customerTable.marketingId],
      references: [userTable.id],
    }),
    customerPics: many(customerPicTable),
    customerProducts: many(customerProductTable),
  })
);
