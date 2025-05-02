import { and, count, db, eq } from '@repo/db';
import { roles } from '@repo/db/model';
import type { RoleInput, RoleUpdate } from '@repo/db/schema';

import { buildWhereClause } from '../../utils/whereClause';

type Role = typeof roles.$inferSelect;

export const getRoles = async (
  query: Partial<Role> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(roles, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.roles.findMany({
    limit,
    offset,
    where: whereClause,
  });

  const total =
    (await db.select({ count: count() }).from(roles).where(whereClause))[0]
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

export const getRole = async (id: number) => {
  const result = await db.query.roles.findFirst({
    where: eq(roles.id, id),
  });

  return result;
};

export const createRole = async (payload: RoleInput) => {
  return db.insert(roles).values(payload).returning();
};

export const updateRole = async (id: number, payload: RoleUpdate) => {
  return db.update(roles).set(payload).where(eq(roles.id, id));
};

export const deleteRole = async (id: number) => {
  return db.delete(roles).where(eq(roles.id, id));
};

export const deleteAllRoles = async () => {
  return db.delete(roles);
};
