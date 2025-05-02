import { and, count, db, eq } from '@repo/db';
import { products } from '@repo/db/model';
import {
  insertProductSchema,
  type ProductInput,
  type ProductUpdate,
} from '@repo/db/schema';

import { buildWhereClause } from '../../utils/whereClause';

type Product = typeof products.$inferSelect;

export const createProduct = async (payload: ProductInput) => {
  return db.insert(products).values(payload).returning();
};

export const bulkInsertProducts = async (payload: any) => {
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

      toInsert.push(insertProductSchema.parse(finalRow));
    } catch (error) {
      console.log('error', row, error);
    }
  });

  const insert = await db.insert(products).values(toInsert);
  return insert;
};

export const getProducts = async (
  query: Partial<Product> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(products, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.products.findMany({
    limit,
    offset,
    where: whereClause,
    with: {
      service: {
        columns: {
          name: true,
        },
      },
    },
  });

  const total =
    (await db.select({ count: count() }).from(products).where(whereClause))[0]
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

export const getProduct = async (id: number) => {
  const result = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      service: {
        columns: {
          name: true,
        },
      },
    },
  });

  return result;
};

export const updateProduct = async (id: number, payload: ProductUpdate) => {
  return db.update(products).set(payload).where(eq(products.id, id));
};

export const deleteProduct = async (id: number) => {
  return db.delete(products).where(eq(products.id, id));
};

export const deleteAllProducts = async () => {
  return db.delete(products);
};
