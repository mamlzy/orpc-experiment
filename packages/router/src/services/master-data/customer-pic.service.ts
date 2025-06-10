import { and, count, db, desc, eq, ilike, isNull, SQL } from '@repo/db';
import { customerPicTable } from '@repo/db/model';
import type {
  CreateCustomerPicSchema,
  GetCustomerPicsSchema,
  UpdateCustomerPicSchema,
} from '@repo/db/schema';

import { createPagination } from '../../lib/utils';

export const createCustomerPic = async (payload: CreateCustomerPicSchema) => {
  return (await db.insert(customerPicTable).values(payload).returning())[0];
};

export const getCustomerPics = async (query?: GetCustomerPicsSchema) => {
  const page = Math.max(Number(query?.page) || 1, 1);
  const limit = Math.max(Number(query?.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const where: SQL[] = [isNull(customerPicTable.deletedAt)];

  if (query?.customerId) {
    where.push(eq(customerPicTable.customerId, query.customerId));
  }

  if (query?.picName) {
    where.push(ilike(customerPicTable.picName, `%${query.picName}%`));
  }

  const data = await db.query.customerPicTable.findMany({
    limit,
    offset,
    where: and(...where),
    with: {
      customer: {
        columns: {
          name: true,
          customerType: true,
        },
      },
    },
    orderBy: [desc(customerPicTable.createdAt)],
  });

  const totalCount =
    (
      await db
        .select({ count: count() })
        .from(customerPicTable)
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

export const getCustomerPic = async (id: string) => {
  const result = await db.query.customerPicTable.findFirst({
    where: eq(customerPicTable.id, id),
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

export const updateCustomerPic = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateCustomerPicSchema;
}) => {
  return (
    await db
      .update(customerPicTable)
      .set(payload)
      .where(eq(customerPicTable.id, id))
      .returning()
  )[0];
};

export const deleteCustomerPicById = async (id: string) => {
  return (
    await db
      .delete(customerPicTable)
      .where(eq(customerPicTable.id, id))
      .returning()
  )[0];
};

export const deleteAllCustomerPics = async () => {
  return db.delete(customerPicTable);
};
