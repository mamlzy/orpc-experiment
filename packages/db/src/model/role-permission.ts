import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { permissionTable } from './permission';
import { roleTable } from './roles';

export const rolePermissionTable = pgTable('role_permissions', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  roleId: varchar({ length: 255 }).references(() => roleTable.id),
  permissionId: varchar({ length: 255 }).references(() => permissionTable.id),
  ...timestamps,
});

export const rolePermissionTableRelations = relations(
  rolePermissionTable,
  ({ one }) => ({
    role: one(roleTable, {
      fields: [rolePermissionTable.roleId],
      references: [roleTable.id],
    }),
    permission: one(permissionTable, {
      fields: [rolePermissionTable.permissionId],
      references: [permissionTable.id],
    }),
  })
);
