import { and, count, db, eq, inArray } from '@repo/db';
import { customers, customersPics } from '@repo/db/model';
import type { CustomerPicInput, CustomerPicUpdate } from '@repo/db/schema';

import { buildWhereClause } from '../../utils/whereClause';

type CustomerPic = typeof customersPics.$inferSelect;

export const createCustomerPic = async (payload: CustomerPicInput) => {
  return db.insert(customersPics).values(payload).returning();
};

export const getCustomerPics = async (
  query: Partial<CustomerPic> & {
    page?: number;
    limit?: number;
    customerType?: 'International' | 'Domestic';
  }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const customerWhereClause = buildWhereClause(customers, {
    customerType: query.customerType,
  });

  const whereClause = customerWhereClause.length
    ? and(
        inArray(
          customersPics.customerId,
          db
            .select({ id: customers.id })
            .from(customers)
            .where(and(...customerWhereClause))
        )
      )
    : undefined;

  const data = await db.query.customersPics.findMany({
    limit,
    offset,
    where: whereClause,
    with: {
      customer: {
        columns: {
          name: true,
          customerType: true,
        },
      },
    },
  });

  const total =
    (
      await db.select({ count: count() }).from(customersPics).where(whereClause)
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

export const getCustomerPic = async (id: number) => {
  const result = await db.query.customersPics.findFirst({
    where: eq(customersPics.id, id),
    with: {
      customer: {
        columns: {
          name: true,
          customerType: true,
        },
      },
    },
  });

  return result;
};

export const updateCustomerPic = async (
  id: number,
  payload: CustomerPicUpdate
) => {
  return db.update(customersPics).set(payload).where(eq(customersPics.id, id));
};

export const deleteCustomerPic = async (id: number) => {
  return db.delete(customersPics).where(eq(customersPics.id, id));
};

export const deleteAllCustomerPics = async () => {
  return db.delete(customersPics);
};
