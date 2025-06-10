import { and, count, db, desc, eq, ilike, isNull, SQL } from '@repo/db';
import { userTable } from '@repo/db/model';
import type { GetAllUsersQuerySchema, UpdateUserSchema } from '@repo/db/schema';

import { createPagination } from '../../lib/utils';

export const getUsers = async (query?: GetAllUsersQuerySchema) => {
  const page = Math.max(Number(query?.page) || 1, 1);
  const limit = Math.max(Number(query?.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const where: SQL[] = [isNull(userTable.deletedAt)];

  if (query?.name) {
    where.push(ilike(userTable.name, `%${query.name}%`));
  }

  const data = await db.query.userTable.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
      companyId: true,
    },
    where: and(...where),
    with: {
      company: {
        columns: {
          companyName: true,
        },
      },
    },
    limit,
    offset,
    orderBy: [desc(userTable.createdAt)],
  });

  const totalCount =
    (
      await db
        .select({ count: count() })
        .from(userTable)
        .where(and(...where))
    )[0]?.count ?? 0;

  const pagination = createPagination({
    page,
    limit,
    totalCount,
  });

  return {
    data,
    pagination,
  };
};

export const getUser = async (id: string) => {
  const result = await db.query.userTable.findFirst({
    where: eq(userTable.id, id),
    with: {
      company: {
        columns: {
          companyName: true,
        },
      },
    },
  });

  return result;
};

export const updateUserById = async ({
  id,
  payload,
  tx,
}: {
  id: string;
  payload: UpdateUserSchema;
  tx?: Parameters<Parameters<typeof db.transaction>[0]>[0];
}) => {
  const dbInstance = tx || db;
  return (
    await dbInstance
      .update(userTable)
      .set(payload)
      .where(eq(userTable.id, id))
      .returning()
  )[0];
};

export const deleteUser = async (id: string) => {
  return db.delete(userTable).where(eq(userTable.id, id));
};

export const deleteAllUsers = async () => {
  return db.delete(userTable);
};
