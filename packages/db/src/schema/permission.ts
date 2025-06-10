import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { permissionTable } from '../model';

export const insertPermissionSchema = createInsertSchema(permissionTable, {
  name: z.string().min(2),
});

export const updatePermissionSchema = createUpdateSchema(permissionTable, {
  name: z.string().optional(),
});

export type PermissionInput = z.infer<typeof insertPermissionSchema>;
export type PermissionUpdate = z.infer<typeof updatePermissionSchema>;
