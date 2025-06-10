import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { rolePermissionTable } from './role-permission';

export const permissionTable = pgTable('permissions', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  name: varchar({ length: 255 }).notNull(),
  ...timestamps,
});

export const permissionTableRelations = relations(
  permissionTable,
  ({ many }) => ({
    rolePermissions: many(rolePermissionTable),
  })
);
