import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { users } from '../model';

export const insertUserSchema = createInsertSchema(users, {
  username: z.string(),
  email: z.string().email(),
  name: z.string().min(3),
  photo: z.string().nullable().optional(),
  companyId: z.preprocess((val) => Number(val), z.number().int().positive()),
});

export const updateUserSchema = createUpdateSchema(users, {
  username: z.string().optional(),
  password: z.string().min(6).optional(),
  email: z.string().email().optional(),
  name: z.string().min(3).optional(),
  photo: z.string().nullable().optional(),
  companyId: z
    .preprocess((val) => Number(val), z.number().int().positive())
    .optional(),
});

export const loginUserSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
});

export type User = typeof users.$inferSelect;
export type UserInput = z.infer<typeof insertUserSchema>;
export type UserUpdate = z.infer<typeof updateUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
