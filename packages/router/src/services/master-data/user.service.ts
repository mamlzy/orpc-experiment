import { and, count, db, eq } from '@repo/db';
import { users } from '@repo/db/model';
import type { UserUpdate } from '@repo/db/schema';

import { buildWhereClause } from '../../utils/whereClause';

type User = typeof users.$inferSelect;

export const getUsers = async (
  query: Partial<User> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(users, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.users.findMany({
    limit,
    offset,
    where: whereClause,
    with: {
      company: {
        columns: {
          companyName: true,
        },
      },
    },
  });

  const total =
    (await db.select({ count: count() }).from(users).where(whereClause))[0]
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

export const getUser = async (id: string) => {
  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
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

export const updateUser = async (id: string, payload: UserUpdate) => {
  // if (payload.password) {
  //   payload.password = await bcrypt.hash(payload.password, 12);
  // }
  return db.update(users).set(payload).where(eq(users.id, id));
};

export const deleteUser = async (id: string) => {
  return db.delete(users).where(eq(users.id, id));
};

export const deleteAllUsers = async () => {
  return db.delete(users);
};
