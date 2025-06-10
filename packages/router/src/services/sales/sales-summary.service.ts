import { and, count, db, eq } from '@repo/db';
import { salesSummaryTable } from '@repo/db/model';

import { buildWhereClause } from '../../utils/where-clause';

type SalesSummary = typeof salesSummaryTable.$inferSelect;

export const createSalesSummary = async (payload: any) => {
  return db.insert(salesSummaryTable).values(payload).returning();
};

export const getSalesSummaries = async (
  query: Partial<SalesSummary> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(salesSummaryTable, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.salesSummaryTable.findMany({
    limit,
    offset,
    where: whereClause,
  });

  const total =
    (
      await db
        .select({ count: count() })
        .from(salesSummaryTable)
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

export const getSalesSummary = async (id: string) => {
  const result = await db.query.salesSummaryTable.findFirst({
    where: eq(salesSummaryTable.id, id),
  });

  return result;
};

export const updateSalesSummary = async (id: string, payload: any) => {
  return db
    .update(salesSummaryTable)
    .set(payload)
    .where(eq(salesSummaryTable.id, id));
};

export const deleteSalesSummary = async (id: string) => {
  return db.delete(salesSummaryTable).where(eq(salesSummaryTable.id, id));
};

export const deleteAllSalesSummaries = async () => {
  return db.delete(salesSummaryTable);
};
