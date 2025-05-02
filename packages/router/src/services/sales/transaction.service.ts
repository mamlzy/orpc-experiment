import { and, count, db, eq } from '@repo/db';
import { transactionItems, transactions } from '@repo/db/model';
import type { TransactionInput, TransactionUpdate } from '@repo/db/schema';

import { buildWhereClause } from '../../utils/whereClause';

type Transaction = typeof transactions.$inferSelect;

export const createTransaction = async (payload: TransactionInput) => {
  const {
    marketingId,
    customerId,
    items,
    taxAmount = 0,
    stampDuty = 0,
  } = payload;

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const grandTotal = subtotal + taxAmount + stampDuty;

  const newTransaction = await db
    .insert(transactions)
    .values({
      marketingId: marketingId ? String(marketingId) : null,
      customerId: Number(customerId),
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount?.toFixed(2) ?? '0',
      stampDuty: stampDuty?.toFixed(2) ?? '0',
      grandTotal: grandTotal.toFixed(2),
    })
    .returning();

  if (!newTransaction[0]) {
    throw new Error('Failed to create transaction');
  }

  const transactionId = newTransaction[0].id;

  await db.insert(transactionItems).values(
    items.map((item) => ({
      transactionsId: Number(transactionId),
      productId: item.productId,
      qty: item.qty,
      price: item.price.toFixed(2),
      status: 'pending' as const,
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

  const whereConditions = buildWhereClause(transactions, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.transactions.findMany({
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
      await db.select({ count: count() }).from(transactions).where(whereClause)
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

export const getTransaction = async (id: number) => {
  const result = await db.query.transactions.findFirst({
    where: eq(transactions.id, id),
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

export const updateTransaction = async (
  id: number,
  payload: TransactionUpdate
) => {
  const { marketingId, customerId, items } = payload;

  // **Update marketing
  if (marketingId) {
    await db
      .update(transactions)
      .set({ marketingId })
      .where(eq(transactions.id, id));
  }

  // **Update customer
  if (customerId) {
    await db
      .update(transactions)
      .set({ customerId })
      .where(eq(transactions.id, id));
  }

  if (items) {
    const existingItems = await db
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionsId, id));

    const existingItemIds = new Set(existingItems.map((item) => item.id));

    for (const item of items) {
      if (item.id && existingItemIds.has(item.id)) {
        // **Update existing item**
        await db
          .update(transactionItems)
          .set({
            productId: item.productId,
            qty: item.qty,
            price: item.price.toFixed(2),
          })
          .where(eq(transactionItems.id, item.id));
      } else {
        // **Add new item**
        await db.insert(transactionItems).values({
          transactionsId: id,
          productId: item.productId,
          qty: item.qty,
          price: item.price.toFixed(2),
          status: 'pending',
        });
      }

      // **Delete items that are not in the payload**
      const newItemIds = new Set(items.map((item) => item.id).filter(Boolean));
      const itemsToDelete = existingItems.filter(
        (item) => !newItemIds.has(item.id)
      );

      for (const item of itemsToDelete) {
        await db
          .delete(transactionItems)
          .where(eq(transactionItems.id, item.id));
      }

      // **Update subtotal and grand total**
      const updatedItems = await db
        .select()
        .from(transactionItems)
        .where(eq(transactionItems.transactionsId, id));

      const subtotal = updatedItems.reduce(
        (sum, item) => sum + item.qty * Number(item.price),
        0
      );
      const transactionData = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, id))
        .then((res) => res[0]);
      const grandTotal =
        subtotal +
        (Number(transactionData?.taxAmount) || 0) +
        (Number(transactionData?.stampDuty) || 0);

      await db
        .update(transactions)
        .set({
          subtotal: subtotal.toFixed(2),
          grandTotal: grandTotal.toFixed(2),
        })
        .where(eq(transactions.id, id));
    }
  }
  return id;
};

export const deleteTransaction = async (id: number) => {
  return db.delete(transactions).where(eq(transactions.id, id));
};

export const deleteAllTransactions = async () => {
  return db.delete(transactions);
};
