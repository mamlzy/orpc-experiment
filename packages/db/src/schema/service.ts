import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

import { services } from '../model';

export const insertServiceSchema = createInsertSchema(services);
export const updateServiceSchema = createUpdateSchema(services);

export type ServiceInput = z.infer<typeof insertServiceSchema>;
export type ServiceUpdate = z.infer<typeof updateServiceSchema>;
