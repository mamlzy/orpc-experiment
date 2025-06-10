import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().trim().min(3),
  username: z.string().trim().min(3),
  email: z.string().trim().email(),
  password: z
    .string()
    .trim()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(50, { message: 'Password cannot exceed 50 characters' }),
  role: z.enum(['admin', 'user']),
});

export const updateUserSchema = createUserSchema.extend({
  password: z
    .string()
    .trim()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(50, { message: 'Password cannot exceed 50 characters' })
    .optional(),
  image: z.string().trim().nullish(),
  imageFile: z.instanceof(File).optional(),
});

export const getAllUsersQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  name: z.string().trim().optional(),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type GetAllUsersQuerySchema = z.infer<typeof getAllUsersQuerySchema>;
