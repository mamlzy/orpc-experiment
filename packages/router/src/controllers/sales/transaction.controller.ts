import { ORPCError, os } from '@orpc/server';
import { z } from 'zod';

import {
  and,
  count,
  db,
  eq,
  getTableColumns,
  ilike,
  inArray,
  isNull,
  SQL,
} from '@repo/db';
import { customerTable, transactionTable, userTable } from '@repo/db/model';
import {
  createTransactionSchema,
  createTransactionsSchema,
  getTransactionByIdQuerySchema,
  getTransactionsQuerySchema,
  updateTransactionSchema,
} from '@repo/db/schema';

import { successResponseNew } from '../../helpers/response';
import { createPagination } from '../../lib/utils';
import * as service from '../../services/sales/transaction.service';

export const createTransaction = os
  .route({ method: 'POST', path: '/sales/transactions' })
  .input(createTransactionSchema)
  .handler(async ({ input }) => {
    try {
      const createdTransaction = (await service.createTransaction(input))[0];

      if (!createdTransaction) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Failed to create transaction',
        });
      }

      return successResponseNew({
        message: 'Transaction created successfully',
        data: createdTransaction,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create transaction',
      });
    }
  });

export const createTransactions = os
  .route({ method: 'POST', path: '/sales/transactions/many' })
  .input(createTransactionsSchema)
  .handler(async ({ input }) => {
    try {
      const transformed = input.map((tx) => {
        const subtotal = tx.items.reduce(
          (sum, item) => sum + item.qty * item.price,
          0
        );
        const grandTotal = subtotal + (tx.taxAmount ?? 0) + (tx.stampDuty ?? 0);

        return {
          marketingId: tx.marketingId ?? null,
          customerId: String(tx.customerId),
          subtotal: subtotal.toFixed(2),
          taxAmount: (tx.taxAmount ?? 0).toFixed(2),
          stampDuty: (tx.stampDuty ?? 0).toFixed(2),
          grandTotal: grandTotal.toFixed(2),
        };
      });

      const createdTransactions = await db
        .insert(transactionTable)
        .values(transformed)
        .returning();

      if (createdTransactions.length < 1) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Failed to create transactions',
        });
      }

      return successResponseNew({
        message: 'Transactions created successfully',
        data: createdTransactions,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create transactions',
      });
    }
  });

export const getTransactions = os
  .route({ method: 'GET', path: '/sales/transactions' })
  .input(getTransactionsQuerySchema.optional())
  .handler(async ({ input }) => {
    try {
      const page = Math.max(Number(input?.page) || 1, 1);
      const limit = Math.max(Number(input?.limit) || 10, 1);
      const offset = (page - 1) * limit;

      const where: SQL[] = [isNull(transactionTable.deletedAt)];

      if (input?.transactionId) {
        where.push(ilike(transactionTable.id, `%${input.transactionId}%`));
      }
      if (input?.marketingId) {
        where.push(
          ilike(transactionTable.marketingId, `%${input.marketingId}%`)
        );
      }
      if (input?.customerId) {
        where.push(ilike(transactionTable.customerId, `%${input.customerId}%`));
      }
      if (input?.status?.length) {
        where.push(inArray(transactionTable.status, input.status));
      }

      const data = await db
        .select({
          ...getTableColumns(transactionTable),
          marketing: {
            name: userTable.name,
          },
          customer: {
            name: customerTable.name,
          },
        })
        .from(transactionTable)
        .leftJoin(userTable, eq(transactionTable.marketingId, userTable.id))
        .leftJoin(
          customerTable,
          eq(transactionTable.customerId, customerTable.id)
        )
        .limit(limit)
        .offset(offset)
        .where(and(...where));

      const totalCount =
        (
          await db
            .select({ count: count() })
            .from(transactionTable)
            .where(and(...where))
        )[0]?.count ?? 0;

      const pagination = createPagination({
        page,
        limit,
        totalCount,
      });

      return successResponseNew({
        message: 'Transactions fetched successfully',
        data,
        pagination,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch transactions',
      });
    }
  });

export const getTransaction = os
  .route({ method: 'GET', path: '/sales/transactions/{id}' })
  .input(getTransactionByIdQuerySchema)
  .handler(async ({ input }) => {
    try {
      const result = await service.getTransaction(input);

      if (!result) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Transaction not found',
        });
      }

      return successResponseNew({
        message: 'Transaction fetched successfully',
        data: result,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch transaction',
      });
    }
  });

export const updateTransaction = os
  .route({
    method: 'PUT',
    path: '/sales/transactions/{id}',
    inputStructure: 'detailed',
  })
  .input(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: updateTransactionSchema,
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await service.updateTransaction({
        id: input.params.id,
        payload: input.body,
      });

      return successResponseNew({
        message: 'Transaction updated successfully',
        data: { result },
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to update transaction',
      });
    }
  });

export const deleteTransaction = os
  .route({ method: 'DELETE', path: '/sales/transactions/{id}' })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await service.deleteTransaction(input.id);

      if (!result) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Transaction not found',
        });
      }

      return successResponseNew({
        message: 'Transaction deleted successfully',
        data: result,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to delete transaction',
      });
    }
  });

export const deleteAllTransactions = os
  .route({ method: 'DELETE', path: '/sales/transactions' })
  .handler(async () => {
    try {
      const result = await service.deleteAllTransactions();
      return successResponseNew({
        message: 'Transactions deleted successfully',
        data: result,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to delete transaction',
      });
    }
  });

export const getTransactionForInvoice = os
  .route({
    method: 'GET',
    path: '/sales/transactions/available-for-invoice/{id}',
  })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await service.getTransactionForInvoice(input.id);

      if (!result) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Transaction not found',
        });
      }

      return successResponseNew({
        message: 'Transaction fetched successfully',
        data: result,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch transaction',
      });
    }
  });

export const getTransactionInvoiceSummary = os
  .route({
    method: 'GET',
    path: '/sales/transactions/invoice-summary/{id}',
  })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await service.getTransactionInvoiceSummary(input.id);

      if (!result) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Transaction not found',
        });
      }

      return successResponseNew({
        message: 'Transaction fetched successfully',
        data: result,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch transaction',
      });
    }
  });
