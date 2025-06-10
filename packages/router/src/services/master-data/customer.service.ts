import { db, eq } from '@repo/db';
import { customerProductTable, customerTable } from '@repo/db/model';
import {
  createCustomerSchema,
  type CreateCustomerSchema,
  type UpdateCustomerSchema,
} from '@repo/db/schema';

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

      toInsert.push(createCustomerSchema.parse(finalRow));
    } catch (error) {
      console.log('error', row, error);
    }
  });

  console.log(toInsert);
  const insert = await db.insert(customerTable).values(toInsert).returning();
  return insert;
};

export const getCustomer = async (id: string) => {
  const result = await db.query.customerTable.findFirst({
    where: eq(customerTable.id, id),
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

export const createCustomer = async (payload: CreateCustomerSchema) => {
  return db.insert(customerTable).values(payload).returning();
};

export const updateCustomer = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateCustomerSchema;
}) => {
  return db
    .update(customerTable)
    .set(payload)
    .where(eq(customerTable.id, id))
    .returning();
};

export const deleteCustomer = async (id: string) => {
  return db.transaction(async (tx) => {
    // delete all customer products
    await tx
      .delete(customerProductTable)
      .where(eq(customerProductTable.customerId, id));

    // delete customer
    await tx.delete(customerTable).where(eq(customerTable.id, id));

    return true;
  });
};

export const deleteAllCustomers = async () => {
  return db.delete(customerTable);
};
