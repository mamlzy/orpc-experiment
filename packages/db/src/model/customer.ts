import { relations } from 'drizzle-orm';
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  varchar,
} from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { companies } from './company';
import { customersPics } from './customer-pic';
import { customersProducts } from './customer-product';
import { users } from './user';

export const businessEntityEnum = pgEnum('business_entity', [
  'PT',
  'CV',
  'UD',
  'Firma',
  'Koperasi',
  'Yayasan',
  'Perorangan',
  'BUMN',
  'BUMS',
  'BUPD',
  'Lainnya',
]);

export const customerTypeEnum = pgEnum('customer_type', [
  'International',
  'Domestic',
]);

export const customerStatusEnum = pgEnum('status', [
  'Active',
  'Inactive',
  'Bank Data',
]);

export const customers = pgTable('customers', {
  id: serial().primaryKey(),
  businessEntity: businessEntityEnum(),
  customerType: customerTypeEnum().default('International'),
  name: varchar({ length: 255 }),
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
  marketingId: varchar({ length: 255 }).references(() => users.id),
  companyId: integer().references(() => companies.id),
  status: customerStatusEnum(),
  ...timestamps,
});

export const customersRelations = relations(customers, ({ one, many }) => ({
  company: one(companies, {
    fields: [customers.companyId],
    references: [companies.id],
  }),
  marketing: one(users, {
    fields: [customers.marketingId],
    references: [users.id],
  }),
  customerPics: many(customersPics),
  customerProducts: many(customersProducts),
}));
