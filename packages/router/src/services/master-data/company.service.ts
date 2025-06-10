import { and, count, db, eq, isNull, like, SQL } from '@repo/db';
import { companyTable } from '@repo/db/model';
import type {
  CreateCompanySchema,
  GetAllCompanyQuery,
  UpdateCompanySchema,
} from '@repo/db/schema';

import { createPagination } from '../../lib/utils';

export const getCompanies = async (query: GetAllCompanyQuery) => {
  const page = Math.max(Number(query?.page) || 1, 1);
  const limit = Math.max(Number(query?.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const where: SQL[] = [isNull(companyTable.deletedAt)];

  if (query?.name) {
    where.push(like(companyTable.companyName, `%${query.name}%`));
  }

  const data = await db.query.companyTable.findMany({
    limit,
    offset,
    where: and(...where),
  });

  const totalCount =
    (
      await db
        .select({ count: count() })
        .from(companyTable)
        .where(and(...where))
    )[0]?.count ?? 0;

  const pagination = createPagination({
    totalCount,
    page,
    limit,
  });

  return {
    data,
    pagination,
  };
};

export const getCompany = (id: string) => {
  return db.query.companyTable.findFirst({
    where: eq(companyTable.id, id),
  });
};

export const createCompany = async (payload: CreateCompanySchema) => {
  return db.insert(companyTable).values(payload).returning();
};

export const updateCompany = async (
  id: string,
  payload: UpdateCompanySchema
) => {
  return db.update(companyTable).set(payload).where(eq(companyTable.id, id));
};

export const deleteCompany = async (id: string) => {
  return db.delete(companyTable).where(eq(companyTable.id, id));
};

export const deleteAllCompanies = async () => {
  return db.delete(companyTable);
};
