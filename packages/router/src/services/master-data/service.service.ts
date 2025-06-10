import { db, eq } from '@repo/db';
import { serviceTable } from '@repo/db/model';
import {
  createServiceSchema,
  type CreateServiceSchema,
  type UpdateServiceSchema,
} from '@repo/db/schema';

export const createService = async (payload: CreateServiceSchema) => {
  return db.insert(serviceTable).values(payload).returning();
};

export const bulkInsertServices = async (payload: any) => {
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

      toInsert.push(createServiceSchema.parse(finalRow));
    } catch (error) {
      console.log('error', row, error);
    }
  });

  const insert = await db.insert(serviceTable).values(toInsert);
  return insert;
};

export const getServiceById = (id: string) => {
  return db.query.serviceTable.findFirst({
    where: eq(serviceTable.id, id),
  });
};

export const updateService = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateServiceSchema;
}) => {
  return db.update(serviceTable).set(payload).where(eq(serviceTable.id, id));
};

export const deleteService = async (id: string) => {
  return db.delete(serviceTable).where(eq(serviceTable.id, id));
};

export const deleteAllServices = async () => {
  return db.delete(serviceTable);
};
