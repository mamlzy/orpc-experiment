import { and, count, db, eq } from '@repo/db';
import { customers } from '@repo/db/model';
import {
  insertCustomerSchema,
  type CustomerInput,
  type CustomerUpdate,
} from '@repo/db/schema';

import { buildWhereClause } from '../../utils/whereClause';

type Customer = typeof customers.$inferSelect;

export const bulkInsertCustomers = async (payload: any) => {
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

      toInsert.push(insertCustomerSchema.parse(finalRow));
    } catch (error) {
      console.log('error', row, error);
    }
  });

  console.log(toInsert);
  const insert = await db.insert(customers).values(toInsert).returning();
  return insert;
};

export const getCustomers = async (
  query: Partial<Customer> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  // const whereConditions = buildWhereClause(customers, query);
  // const whereClause = whereConditions.length
  //   ? and(...whereConditions)
  //   : undefined;

  const data = await db.query.customers.findMany({
    limit,
    offset,
    // where: whereClause,
    with: {
      company: {
        columns: {
          companyName: true,
        },
      },
      marketing: {
        columns: {
          name: true,
        },
      },
    },
  });

  const total =
    (await db.select({ count: count() }).from(customers))[0]?.count ?? 0;

  return {
    data,
    pagination: {
      total_page: Math.ceil(Number(total) / limit),
      total: Number(total),
      current_page: page,
    },
  };
};

export const getCustomer = async (id: number) => {
  const result = await db.query.customers.findFirst({
    where: eq(customers.id, id),
    with: {
      company: {
        columns: {
          companyName: true,
        },
      },
      marketing: {
        columns: {
          name: true,
        },
      },
    },
  });

  return result;
};

export const createCustomer = async (payload: CustomerInput) => {
  return db.insert(customers).values(payload).returning();
};

export const updateCustomer = async (id: number, payload: CustomerUpdate) => {
  return db.update(customers).set(payload).where(eq(customers.id, id));
};

export const deleteCustomer = async (id: number) => {
  return db.delete(customers).where(eq(customers.id, id));
};

export const deleteAllCustomers = async () => {
  return db.delete(customers);
};
