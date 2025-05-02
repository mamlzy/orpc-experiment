import * as fs from 'fs/promises';
import type { Context } from 'hono';

import { payments } from '@repo/db/model';
import { insertPaymentSchema, updatePaymentSchema } from '@repo/db/schema';

import { errorResponse, successResponse } from '../../helpers/response';
import * as service from '../../services/ar/payment.service';
import { bulkInsert } from '../../utils/bulkInsert';
import { parseRequest } from '../../utils/parseRequest';

export const createPayment = async (ctx: Context) => {
  try {
    const body = await parseRequest(ctx);
    const payload = insertPaymentSchema.parse(body);

    const result = await service.createPayment(payload);
    return ctx.json(successResponse(result, 'Payment created successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to create Payment'), 500);
  }
};

export const bulkInsertPayments = async (c: Context) => {
  try {
    const filePath = c.get('filePath');
    if (!filePath) {
      return c.json({ error: 'File not found' }, 400);
    }

    const file = new File([await fs.readFile(filePath.path)], filePath.name);
    const result = await bulkInsert(file, {
      table: payments,
      schema: insertPaymentSchema,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Bulk insert failed' }, 500);
  }
};

export const getPayments = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getPayments(query);

    return ctx.json(
      successResponse(
        result.data,
        'Payments fetched successfully',
        result.pagination
      )
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch Payments'), 500);
  }
};

export const getPayment = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.getPayment(id);

    if (!result) {
      return ctx.json(errorResponse('Payment not found', '404'));
    }

    return ctx.json(successResponse(result, 'Payment fetched successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch Payment'), 500);
  }
};

export const updatePayment = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));

    const body = await parseRequest(ctx);
    const payload = updatePaymentSchema.parse(body);

    const result = await service.updatePayment(id, payload);

    return ctx.json(successResponse(result, 'Payment updated successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to update Payment'), 500);
  }
};

export const deletePayment = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.deletePayment(id);

    return ctx.json(successResponse(result, 'Payment deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete Payment'), 500);
  }
};

export const deleteAllPayments = async (ctx: Context) => {
  try {
    const result = await service.deleteAllPayments();
    return ctx.json(successResponse(result, 'Payments deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete Payments'), 500);
  }
};
