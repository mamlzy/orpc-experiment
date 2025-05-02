import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { sessions } from '../model';

export const insertSessionSchema = createInsertSchema(sessions, {
  token: z.string(),
  ipAddress: z.string().min(6),
  userAgent: z.string().min(3),
  userId: z.number(),
});

export const updateSessionSchema = createUpdateSchema(sessions, {
  token: z.string().optional(),
  ipAddress: z.string().min(6).optional(),
  userAgent: z.string().min(3).optional(),
  userId: z.number().optional(),
});

export type SessionInput = z.infer<typeof insertSessionSchema>;
export type SessionUpdate = z.infer<typeof updateSessionSchema>;
