import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { roleTable } from '../model';

export const insertRoleSchema = createInsertSchema(roleTable, {
  name: z.string().min(2),
});

export const updateRoleSchema = createUpdateSchema(roleTable, {
  name: z.string().optional(),
});

export type RoleInput = z.infer<typeof insertRoleSchema>;
export type RoleUpdate = z.infer<typeof updateRoleSchema>;
