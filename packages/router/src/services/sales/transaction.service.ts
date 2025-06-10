import { and, count, db, eq, isNull, SQL } from '@repo/db';
import {
  invoiceTable,
  transactionItemTable,
  transactionTable,
} from '@repo/db/model';
import type {
  CreateTransactionSchema,
  GetTransactionByIdQuerySchema,
  UpdateTransactionSchema,
} from '@repo/db/schema';

import { buildWhereClause } from '../../utils/where-clause';

type Transaction = typeof transactionTable.$inferSelect;

export const createTransaction = async (payload: CreateTransactionSchema) => {
  const {
    marketingId,
    customerId,
    items,
    taxAmount = 0,
    stampDuty = 0,
  } = payload;

  const subtotal = items.reduce(
    (sum: number, item) => sum + item.qty * item.price,
    0
  );
  const grandTotal = subtotal + taxAmount + stampDuty;

  const newTransaction = await db
    .insert(transactionTable)
    .values({
      marketingId,
      customerId,
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      stampDuty: stampDuty.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    })
    .returning();

  if (!newTransaction[0]) {
    throw new Error('Failed to create transaction');
  }

  const transactionId = newTransaction[0].id;

  await db.insert(transactionItemTable).values(
    items.map((item) => ({
      transactionId,
      productId: item.productId,
      qty: item.qty,
      price: item.price.toFixed(2),
      status: 'PENDING' as const,
    }))
  );

  return newTransaction;
};

export const getTransactions = async (
  query: Partial<Transaction> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(transactionTable, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.transactionTable.findMany({
    limit,
    offset,
    where: whereClause,
    with: {
      marketing: {
        columns: {
          name: true,
        },
      },
      customer: {
        columns: {
          name: true,
        },
      },
      items: {
        columns: {
          id: true,
          productId: true,
          qty: true,
          price: true,
        },
        with: {
          product: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

  const total =
    (
      await db
        .select({ count: count() })
        .from(transactionTable)
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

export const getTransaction = async (input: GetTransactionByIdQuerySchema) => {
  const where: SQL[] = [
    isNull(transactionTable.deletedAt),
    eq(transactionTable.id, input.id),
  ];

  if (input.status) {
    where.push(eq(transactionTable.status, input.status));
  }

  const result = await db.query.transactionTable.findFirst({
    where: and(...where),
    with: {
      marketing: {
        columns: {
          name: true,
        },
      },
      customer: {
        columns: {
          name: true,
        },
      },
      items: {
        columns: {
          id: true,
          productId: true,
          qty: true,
          price: true,
        },
        with: {
          product: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
  });

  return result;
};

export const getTransactionForInvoice = async (id: string) => {
  const result = await db.query.transactionTable.findFirst({
    where: and(
      eq(transactionTable.id, id),
      eq(transactionTable.status, 'PENDING')
    ),
    with: {
      marketing: {
        columns: {
          name: true,
        },
      },
      customer: {
        columns: {
          name: true,
        },
      },
      items: {
        columns: {
          id: true,
          productId: true,
          qty: true,
          price: true,
        },
        with: {
          product: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
  });

  return result;
};

export const updateTransaction = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateTransactionSchema;
}) => {
  const { marketingId, customerId, items } = payload;

  // **Update marketing
  if (marketingId) {
    await db
      .update(transactionTable)
      .set({ marketingId })
      .where(eq(transactionTable.id, id));
  }

  // **Update customer
  if (customerId) {
    await db
      .update(transactionTable)
      .set({ customerId })
      .where(eq(transactionTable.id, id));
  }

  if (items) {
    const existingItems = await db
      .select()
      .from(transactionItemTable)
      .where(eq(transactionItemTable.transactionId, id));

    const existingItemIds = new Set(existingItems.map((item) => item.id));

    for (const item of items) {
      if (item.id && existingItemIds.has(item.id)) {
        // **Update existing item**
        await db
          .update(transactionItemTable)
          .set({
            productId: item.productId,
            qty: item.qty,
            price: item.price.toFixed(2),
          })
          .where(eq(transactionItemTable.id, item.id));
      } else {
        // **Add new item**
        await db.insert(transactionItemTable).values({
          transactionId: id,
          productId: item.productId,
          qty: item.qty,
          price: item.price.toFixed(2),
          status: 'PENDING',
        });
      }

      // **Delete items that are not in the payload**
      const newItemIds = new Set(
        items.map((item: any) => item.id).filter(Boolean)
      );
      const itemsToDelete = existingItems.filter(
        (item) => !newItemIds.has(item.id)
      );

      for (const item of itemsToDelete) {
        await db
          .delete(transactionItemTable)
          .where(eq(transactionItemTable.id, item.id));
      }

      // **Update subtotal and grand total**
      const updatedItems = await db
        .select()
        .from(transactionItemTable)
        .where(eq(transactionItemTable.transactionId, id));

      const subtotal = updatedItems.reduce(
        (sum, item) => sum + item.qty * Number(item.price),
        0
      );
      const transactionData = await db
        .select()
        .from(transactionTable)
        .where(eq(transactionTable.id, id))
        .then((res) => res[0]);
      const grandTotal =
        subtotal +
        (Number(transactionData?.taxAmount) || 0) +
        (Number(transactionData?.stampDuty) || 0);

      await db
        .update(transactionTable)
        .set({
          subtotal: subtotal.toFixed(2),
          grandTotal: grandTotal.toFixed(2),
        })
        .where(eq(transactionTable.id, id));
    }
  }
  return id;
};

export const deleteTransaction = async (id: string) => {
  return (
    await db.transaction(async (tx) => {
      await tx
        .delete(transactionItemTable)
        .where(eq(transactionItemTable.transactionId, id));

      const deletedTransaction = await tx
        .delete(transactionTable)
        .where(eq(transactionTable.id, id))
        .returning();

      return deletedTransaction;
    })
  )[0];
};

export const deleteAllTransactions = async () => {
  return db.delete(transactionTable);
};

export const getTransactionInvoiceSummary = async (id: string) => {
  const transaction = await db.query.transactionTable.findFirst({
    where: eq(transactionTable.id, id),
  });

  if (transaction) {
    const getTransactionInvoicedAmount = await db.query.invoiceTable.findFirst({
      where: and(eq(invoiceTable.transactionId, id)),
    });

    const invoicedAmount = Number(getTransactionInvoicedAmount?.subtotal) || 0;
    const remainingAmount = Number(transaction.grandTotal) - invoicedAmount;
    const percentage = (invoicedAmount / Number(transaction.grandTotal)) * 100;

    return {
      transactionTotal: transaction.grandTotal,
      invoicedAmount,
      percentageInvoiced: Math.round(percentage),
      remainingAmount,
      percentageRemaining: 100 - Math.round(percentage),
    };
  }
};
