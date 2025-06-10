import { and, count, db, eq } from '@repo/db';
import { bankAccountTable } from '@repo/db/model';
import { type BankAccountInput, type BankAccountUpdate } from '@repo/db/schema';

import { buildWhereClause } from '../../utils/where-clause';

export const createBankAccount = async (payload: BankAccountInput) => {
  return db.insert(bankAccountTable).values(payload).returning();
};

export const getBankAccounts = async (
  query: Partial<BankAccountInput> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(bankAccountTable, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.bankAccountTable.findMany({
    limit,
    offset,
    where: whereClause,
  });

  const total =
    (
      await db
        .select({ count: count() })
        .from(bankAccountTable)
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

export const getBankAccount = async (id: string) => {
  const result = await db.query.bankAccountTable.findFirst({
    where: eq(bankAccountTable.id, id),
  });

  return result;
};

export const updateBankAccount = async (
  id: string,
  payload: BankAccountUpdate
) => {
  return db
    .update(bankAccountTable)
    .set(payload)
    .where(eq(bankAccountTable.id, id))
    .returning();
};

export const deleteBankAccount = async (id: string) => {
  return db.delete(bankAccountTable).where(eq(bankAccountTable.id, id));
};

export const deleteAllBankAccounts = async () => {
  return db.delete(bankAccountTable);
};
