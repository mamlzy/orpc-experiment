import { and, count, db, eq } from '@repo/db';
import { salesSummaries } from '@repo/db/model';

import { buildWhereClause } from '../../utils/whereClause';

type SalesSummary = typeof salesSummaries.$inferSelect;

export const createSalesSummary = async (payload: any) => {
  return db.insert(salesSummaries).values(payload).returning();
};

export const getSalesSummaries = async (
  query: Partial<SalesSummary> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(salesSummaries, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.salesSummaries.findMany({
    limit,
    offset,
    where: whereClause,
  });

  const total =
    (
      await db
        .select({ count: count() })
        .from(salesSummaries)
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

export const getSalesSummary = async (id: number) => {
  const result = await db.query.salesSummaries.findFirst({
    where: eq(salesSummaries.id, id),
  });

  return result;
};

export const updateSalesSummary = async (id: number, payload: any) => {
  return db
    .update(salesSummaries)
    .set(payload)
    .where(eq(salesSummaries.id, id));
};

export const deleteSalesSummary = async (id: number) => {
  return db.delete(salesSummaries).where(eq(salesSummaries.id, id));
};

export const deleteAllSalesSummaries = async () => {
  return db.delete(salesSummaries);
};
