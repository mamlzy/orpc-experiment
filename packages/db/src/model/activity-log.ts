import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { jsonb, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';
import { userTable } from './user';

export const activityLogActionEnum = pgEnum('activity_log_action', [
  'VIEWED',
  'CREATED',
  'UPDATED',
  'DELETED',
]);
export type ActivityLogTypeEnum =
  (typeof activityLogActionEnum.enumValues)[number];

export const activityLogTable = pgTable('activity_logs', {
  id: varchar({ length: 255 }).primaryKey().$defaultFn(createId),
  tableName: varchar({ length: 255 }).notNull(),
  recordId: varchar({ length: 255 }).notNull(),
  action: activityLogActionEnum().notNull(),
  userId: varchar({ length: 255 }).references(() => userTable.id),
  changes: jsonb(),
  ...timestamps,
});

export type ActivityLog = typeof activityLogTable.$inferSelect;

export const activityLogTableRelations = relations(
  activityLogTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [activityLogTable.userId],
      references: [userTable.id],
    }),
  })
);
