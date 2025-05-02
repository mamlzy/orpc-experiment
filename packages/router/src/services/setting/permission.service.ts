import { and, count, db, eq } from '@repo/db';
import { permissions } from '@repo/db/model';
import type { PermissionInput, PermissionUpdate } from '@repo/db/schema';

import { buildWhereClause } from '../../utils/whereClause';

type Permission = typeof permissions.$inferSelect;

export const getPermissions = async (
  query: Partial<Permission> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(permissions, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.permissions.findMany({
    limit,
    offset,
    where: whereClause,
  });

  const total =
    (
      await db.select({ count: count() }).from(permissions).where(whereClause)
    )[0]?.count ?? 0;

  return {
    data,
    pagination: {
      total_page: Math.ceil(Number(total) / limit),
      total: Number(total),
      current_page: page,
    },
  };
};

export const getPermission = async (id: number) => {
  const result = await db.query.permissions.findFirst({
    where: eq(permissions.id, id),
  });

  return result;
};

export const createPermission = async (payload: PermissionInput) => {
  const permissionId = await db.insert(permissions).values(payload).returning();
  return permissionId;
};

export const updatePermission = async (
  id: number,
  payload: PermissionUpdate
) => {
  return db.update(permissions).set(payload).where(eq(permissions.id, id));
};

export const deletePermission = async (id: number) => {
  return db.delete(permissions).where(eq(permissions.id, id));
};

export const deleteAllPermissions = async () => {
  return db.delete(permissions);
};
