import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { roles } from '../model';

export const insertRoleSchema = createInsertSchema(roles, {
  name: z.string().min(2),
});

export const updateRoleSchema = createUpdateSchema(roles, {
  name: z.string().optional(),
});

export type RoleInput = z.infer<typeof insertRoleSchema>;
export type RoleUpdate = z.infer<typeof updateRoleSchema>;
