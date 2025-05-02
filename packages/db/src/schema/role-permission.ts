import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { rolePermissions } from '../model';

export const insertRolePermissionSchema = createInsertSchema(rolePermissions, {
  name: z.string().min(2),
  roleId: z.number(),
  permissionId: z.number(),
});

export const updateRolePermissionSchema = createUpdateSchema(rolePermissions, {
  name: z.string().optional(),
  roleId: z.number().optional(),
  permissionId: z.number().optional(),
});

export type RolePermissionInput = z.infer<typeof insertRolePermissionSchema>;
export type RolePermissionUpdate = z.infer<typeof updateRolePermissionSchema>;
