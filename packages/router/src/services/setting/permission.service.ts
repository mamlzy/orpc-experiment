import { and, count, db, eq } from '@repo/db';
import { permissionTable } from '@repo/db/model';
import type { PermissionInput, PermissionUpdate } from '@repo/db/schema';

import { buildWhereClause } from '../../utils/where-clause';

type Permission = typeof permissionTable.$inferSelect;

export const getPermissions = async (
  query: Partial<Permission> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(permissionTable, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.permissionTable.findMany({
    limit,
    offset,
    where: whereClause,
  });

  const total =
    (
      await db
        .select({ count: count() })
        .from(permissionTable)
        .where(whereClause)
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

export const getPermission = async (id: string) => {
  const result = await db.query.permissionTable.findFirst({
    where: eq(permissionTable.id, id),
  });

  return result;
};

export const createPermission = async (payload: PermissionInput) => {
  const permissionId = await db
    .insert(permissionTable)
    .values(payload)
    .returning();
  return permissionId;
};

export const updatePermission = async (
  id: string,
  payload: PermissionUpdate
) => {
  return db
    .update(permissionTable)
    .set(payload)
    .where(eq(permissionTable.id, id));
};

export const deletePermission = async (id: string) => {
  return db.delete(permissionTable).where(eq(permissionTable.id, id));
};

export const deleteAllPermissions = async () => {
  return db.delete(permissionTable);
};
