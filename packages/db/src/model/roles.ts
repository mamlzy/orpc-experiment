import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { permissions } from './permission';

export const roles = pgTable('roles', {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  ...timestamps,
});

export const rolesRelations = relations(roles, ({ many }) => ({
  permission: many(permissions),
}));
