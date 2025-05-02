import { and, count, db, eq } from '@repo/db';
import { customersProducts } from '@repo/db/model';
import type {
  CustomerProductInput,
  CustomerProductUpdate,
} from '@repo/db/schema';

import { buildWhereClause } from '../../utils/whereClause';

type CustomerProduct = typeof customersProducts.$inferSelect;

export const createCustomerProduct = async (payload: CustomerProductInput) => {
  return db.insert(customersProducts).values(payload).returning();
};

export const getCustomerProducts = async (
  query: Partial<CustomerProduct> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(customersProducts, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.customersProducts.findMany({
    limit,
    offset,
    where: whereClause,
  });

  const total =
    (
      await db
        .select({ count: count() })
        .from(customersProducts)
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

export const getCustomerProduct = async (id: number) => {
  const result = await db.query.customersProducts.findFirst({
    where: eq(customersProducts.id, id),
  });

  return result;
};

export const updateCustomerProduct = async (
  id: number,
  payload: CustomerProductUpdate
) => {
  return db
    .update(customersProducts)
    .set(payload)
    .where(eq(customersProducts.id, id));
};

export const deleteCustomerProduct = async (id: number) => {
  return db.delete(customersProducts).where(eq(customersProducts.id, id));
};

export const deleteAllCustomerProducts = async () => {
  return db.delete(customersProducts);
};
