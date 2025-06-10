import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().trim().nonempty(),
  description: z.string().trim().nonempty(),
});

export const createServicesSchema = createServiceSchema.array();

export const updateServiceSchema = createServiceSchema;

export type CreateServiceSchema = z.infer<typeof createServiceSchema>;
export type UpdateServiceSchema = z.infer<typeof updateServiceSchema>;
