import * as fs from 'fs/promises';
import type { Context } from 'hono';

import { transactions } from '@repo/db/model';
import {
  insertTransactionSchema,
  updateTransactionSchema,
} from '@repo/db/schema';

import { errorResponse, successResponse } from '../../helpers/response';
import * as service from '../../services/sales/transaction.service';
import { bulkInsert } from '../../utils/bulkInsert';
import { parseRequest } from '../../utils/parseRequest';

export const createTransaction = async (ctx: Context) => {
  try {
    const body = await parseRequest(ctx);
    const payload = insertTransactionSchema.parse(body);

    const result = await service.createTransaction(payload);
    return ctx.json(
      successResponse(result, 'Transaction created successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to create Transaction'), 500);
  }
};

export const bulkInsertTransactions = async (c: Context) => {
  try {
    const filePath = c.get('filePath');
    if (!filePath) {
      return c.json({ error: 'File not found' }, 400);
    }

    const file = new File([await fs.readFile(filePath.path)], filePath.name);
    const result = await bulkInsert(file, {
      table: transactions,
      schema: insertTransactionSchema,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Bulk insert failed' }, 500);
  }
};

export const getTransactions = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getTransactions(query);

    return ctx.json(
      successResponse(
        result.data,
        'Transactions fetched successfully',
        result.pagination
      )
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch Transactions'), 500);
  }
};

export const getTransaction = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.getTransaction(id);

    if (!result) {
      return ctx.json(errorResponse('Transaction not found', '404'));
    }

    return ctx.json(
      successResponse(result, 'Transaction fetched successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch Transaction'), 500);
  }
};

export const updateTransaction = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));

    const body = await parseRequest(ctx);
    const payload = updateTransactionSchema.parse(body);

    const result = await service.updateTransaction(id, payload);

    return ctx.json(
      successResponse(result, 'Transaction updated successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to update Transaction'), 500);
  }
};

export const deleteTransaction = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.deleteTransaction(id);

    return ctx.json(
      successResponse(result, 'Transaction deleted successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete Transaction'), 500);
  }
};

export const deleteAllTransactions = async (ctx: Context) => {
  try {
    const result = await service.deleteAllTransactions();
    return ctx.json(
      successResponse(result, 'Transactions deleted successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete Transactions'), 500);
  }
};
