import { db } from '@repo/db';
import { activityLogTable } from '@repo/db/model';
import { createActivityLogSchema } from '@repo/db/schema';
import type { CreateActivityLogSchema } from '@repo/db/schema';

export async function activitylog(payload: CreateActivityLogSchema) {
  const validated = createActivityLogSchema.parse(payload);

  await db.insert(activityLogTable).values({
    ...validated,
  });
}
