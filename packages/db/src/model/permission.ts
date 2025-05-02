import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '../lib/columns.helper';

export const permissions = pgTable('permissions', {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  ...timestamps,
});
