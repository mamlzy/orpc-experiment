import { db, eq } from '@repo/db';
import { productTable } from '@repo/db/model';
import {
  createProductSchema,
  type CreateProductSchema,
  type UpdateProductSchema,
} from '@repo/db/schema';

export const createProduct = async (payload: CreateProductSchema) => {
  const createdProducts = await db
    .insert(productTable)
    .values(payload)
    .returning();

  return createdProducts[0];
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

      toInsert.push(createProductSchema.parse(finalRow));
    } catch (error) {
      console.log('error', row, error);
    }
  });

  const insert = await db.insert(productTable).values(toInsert);
  return insert;
};

export const getProduct = async (id: string) => {
  const result = await db.query.productTable.findFirst({
    where: eq(productTable.id, id),
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

export const updateProductById = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateProductSchema;
}) => {
  return db
    .update(productTable)
    .set(payload)
    .where(eq(productTable.id, id))
    .returning();
};

export const deleteProduct = async (id: string) => {
  return db.delete(productTable).where(eq(productTable.id, id)).returning();
};

export const deleteAllProducts = async () => {
  return db.delete(productTable);
};
