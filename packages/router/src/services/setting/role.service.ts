import { and, count, db, eq } from '@repo/db';
import { roleTable } from '@repo/db/model';
import type { RoleInput, RoleUpdate } from '@repo/db/schema';

import { buildWhereClause } from '../../utils/where-clause';

type Role = typeof roleTable.$inferSelect;

export const getRoles = async (
  query: Partial<Role> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(roleTable, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.roleTable.findMany({
    limit,
    offset,
    where: whereClause,
  });

  const total =
    (await db.select({ count: count() }).from(roleTable).where(whereClause))[0]
      ?.count ?? 0;

  return {
    data,
    pagination: {
      total_page: Math.ceil(Number(total) / limit),
      total: Number(total),
      current_page: page,
    },
  };
};

export const getRole = async (id: string) => {
  const result = await db.query.roleTable.findFirst({
    where: eq(roleTable.id, id),
  });

  return result;
};

export const createRole = async (payload: RoleInput) => {
  return db.insert(roleTable).values(payload).returning();
};

export const updateRole = async (id: string, payload: RoleUpdate) => {
  return db.update(roleTable).set(payload).where(eq(roleTable.id, id));
};

export const deleteRole = async (id: string) => {
  return db.delete(roleTable).where(eq(roleTable.id, id));
};

export const deleteAllRoles = async () => {
  return db.delete(roleTable);
};
