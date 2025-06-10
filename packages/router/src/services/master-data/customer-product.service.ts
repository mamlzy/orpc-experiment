import { and, db, eq, inArray } from '@repo/db';
import { customerProductTable, customerTable } from '@repo/db/model';
import type {
  CreateCustomerProductSchema,
  ManageCustomerProductsSchema,
  UpdateCustomerProductSchema,
} from '@repo/db/schema';

export const createCustomerProduct = async (
  payload: CreateCustomerProductSchema
) => {
  return db.insert(customerProductTable).values(payload).returning();
};

export const getCustomerProduct = async (id: string) => {
  const result = await db.query.customerProductTable.findFirst({
    where: eq(customerProductTable.id, id),
  });

  return result;
};

export const updateCustomerProduct = async (
  id: string,
  payload: UpdateCustomerProductSchema
) => {
  return db
    .update(customerProductTable)
    .set(payload)
    .where(eq(customerProductTable.id, id));
};

export const deleteCustomerProduct = async (id: string) => {
  return db.delete(customerProductTable).where(eq(customerProductTable.id, id));
};

export const deleteAllCustomerProducts = async () => {
  return db.delete(customerProductTable);
};

export const manageCustomerProducts = async (
  payload: ManageCustomerProductsSchema
) => {
  const { customerId, deepeningProductIds, successProductIds } = payload;

  const customer = await db.query.customerTable.findFirst({
    where: eq(customerTable.id, customerId),
    with: {
      customerProducts: true,
    },
  });

  const oldCustomerProductIds =
    customer?.customerProducts
      .filter((cp) => !!cp.productId)
      .map((cp) => cp.productId!) || [];

  if (!customer) {
    throw new Error('Customer not found');
  }

  const deepeningProducts: CreateCustomerProductSchema[] =
    deepeningProductIds.map((product) => ({
      customerId,
      productId: product,
      description: null,
      status: 'DEEPENING',
    }));

  const successProducts: CreateCustomerProductSchema[] = successProductIds.map(
    (product) => ({
      customerId,
      productId: product,
      description: null,
      status: 'SUCCESS',
    })
  );

  const combinedCustomerProducts: CreateCustomerProductSchema[] = [
    ...deepeningProducts,
    ...successProducts,
  ];

  const result = await db.transaction(async (tx) => {
    if (oldCustomerProductIds.length > 0) {
      // delete all this customer's products
      await tx
        .delete(customerProductTable)
        .where(
          and(
            eq(customerProductTable.customerId, customerId),
            inArray(customerProductTable.productId, oldCustomerProductIds)
          )
        );
    }

    // if there any products, create them
    if (combinedCustomerProducts.length > 0) {
      await tx
        .insert(customerProductTable)
        .values(combinedCustomerProducts)
        .returning();
    }

    return true;
  });

  return result;
};
