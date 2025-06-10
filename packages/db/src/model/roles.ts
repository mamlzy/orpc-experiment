import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { permissionTable } from './permission';

export const roleTable = pgTable('roles', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  name: varchar({ length: 255 }).notNull(),
  ...timestamps,
});

export const roleTableRelations = relations(roleTable, ({ many }) => ({
  permission: many(permissionTable),
}));
