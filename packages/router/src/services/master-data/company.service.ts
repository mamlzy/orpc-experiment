import { and, count, db, eq } from '@repo/db';
import { companies } from '@repo/db/model';
import type { CompanyInput, CompanyUpdate } from '@repo/db/schema';

import { buildWhereClause } from '../../utils/whereClause';

type Company = typeof companies.$inferSelect;

export const getCompanies = async (
  query: Partial<Company> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(companies, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.companies.findMany({
    limit,
    offset,
    where: whereClause,
  });

  const total =
    (await db.select({ count: count() }).from(companies).where(whereClause))[0]
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

export const getCompany = async (id: number) => {
  const result = await db.query.companies.findFirst({
    where: eq(companies.id, id),
  });

  return result;
};

export const createCompany = async (payload: CompanyInput) => {
  return db.insert(companies).values(payload).returning();
};

export const updateCompany = async (id: number, payload: CompanyUpdate) => {
  return db.update(companies).set(payload).where(eq(companies.id, id));
};

export const deleteCompany = async (id: number) => {
  return db.delete(companies).where(eq(companies.id, id));
};

export const deleteAllCompanies = async () => {
  return db.delete(companies);
};
