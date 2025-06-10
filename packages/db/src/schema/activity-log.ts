import { z } from 'zod';

import { activityLogActionEnum } from '../model/activity-log';

const optionalStrinDData = z.string().nullable().optional();

export const createActivityLogSchema = z.object({
  tableName: z.string(),
  recordId: z.string(),
  action: z.enum(activityLogActionEnum.enumValues),
  userId: z.string(),
  changes: z.any(),
});

export const updateActivityLogSchema = z.object({
  tableName: optionalStrinDData,
  recordId: optionalStrinDData,
  action: z.enum(activityLogActionEnum.enumValues).optional(),
  userId: optionalStrinDData,
  changes: z.any(),
});

export type CreateActivityLogSchema = z.infer<typeof createActivityLogSchema>;
export type UpdateActivityLogSchema = z.infer<typeof updateActivityLogSchema>;
