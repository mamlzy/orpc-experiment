import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { permissions } from '../model';

export const insertPermissionSchema = createInsertSchema(permissions, {
  name: z.string().min(2),
});

export const updatePermissionSchema = createUpdateSchema(permissions, {
  name: z.string().optional(),
});

export type PermissionInput = z.infer<typeof insertPermissionSchema>;
export type PermissionUpdate = z.infer<typeof updatePermissionSchema>;
