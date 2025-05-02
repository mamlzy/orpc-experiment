import { and, count, db, eq } from '@repo/db';
import { services } from '@repo/db/model';
import {
  insertServiceSchema,
  type ServiceInput,
  type ServiceUpdate,
} from '@repo/db/schema';

import { buildWhereClause } from '../../utils/whereClause';

type Service = typeof services.$inferSelect;

export const createService = async (payload: ServiceInput) => {
  return db.insert(services).values(payload).returning();
};

export const bulkInsertServices = async (payload: any) => {
  const toInsert: any = [];

  payload.forEach((row: any) => {
    try {
      const cleanedRow = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          value === '' || value === "''" ? null : value,
        ])
      );

      const finalRow = {
        ...cleanedRow,
      };

      toInsert.push(insertServiceSchema.parse(finalRow));
    } catch (error) {
      console.log('error', row, error);
    }
  });

  const insert = await db.insert(services).values(toInsert);
  return insert;
};

export const getServices = async (
  query: Partial<Service> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(services, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.services.findMany({
    limit,
    offset,
    where: whereClause,
  });

  const total =
    (await db.select({ count: count() }).from(services).where(whereClause))[0]
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

export const getService = async (id: number) => {
  const result = await db.query.services.findFirst({
    where: eq(services.id, id),
  });

  return result;
};

export const updateService = async (id: number, payload: ServiceUpdate) => {
  return db.update(services).set(payload).where(eq(services.id, id));
};

export const deleteService = async (id: number) => {
  return db.delete(services).where(eq(services.id, id));
};

export const deleteAllServices = async () => {
  return db.delete(services);
};
