import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { rolePermissionTable } from '../model';

export const insertRolePermissionSchema = createInsertSchema(
  rolePermissionTable,
  {
    roleId: z.number(),
    permissionId: z.number(),
  }
);

export const updateRolePermissionSchema = createUpdateSchema(
  rolePermissionTable,
  {
    name: z.string().optional(),
    roleId: z.number().optional(),
    permissionId: z.number().optional(),
  }
);

export type RolePermissionInput = z.infer<typeof insertRolePermissionSchema>;
export type RolePermissionUpdate = z.infer<typeof updateRolePermissionSchema>;
