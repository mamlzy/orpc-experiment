import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { permissions } from './permission';
import { roles } from './roles';

export const rolePermissions = pgTable('role_permissions', {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  roleId: integer().references(() => roles.id),
  permissionId: integer().references(() => permissions.id),
  ...timestamps,
});

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  })
);
