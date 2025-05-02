import * as fs from 'fs/promises';
import type { Context } from 'hono';

import { invoices } from '@repo/db/model';
import { insertInvoiceSchema, updateInvoiceSchema } from '@repo/db/schema';

import { errorResponse, successResponse } from '../../helpers/response';
import * as service from '../../services/ar/invoice.service';
import { bulkInsert } from '../../utils/bulkInsert';
import { parseRequest } from '../../utils/parseRequest';

export const createInvoice = async (ctx: Context) => {
  try {
    const body = await parseRequest(ctx);
    const payload = insertInvoiceSchema.parse(body);

    const result = await service.createInvoice(payload);
    return ctx.json(successResponse(result, 'Invoice created successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to create Invoice'), 500);
  }
};

export const bulkInsertInvoices = async (c: Context) => {
  try {
    const filePath = c.get('filePath');
    if (!filePath) {
      return c.json({ error: 'File not found' }, 400);
    }

    const file = new File([await fs.readFile(filePath.path)], filePath.name);
    const result = await bulkInsert(file, {
      table: invoices,
      schema: insertInvoiceSchema,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Bulk insert failed' }, 500);
  }
};

export const getInvoices = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getInvoices(query);

    return ctx.json(
      successResponse(
        result.data,
        'Invoices fetched successfully',
        result.pagination
      )
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch Invoices'), 500);
  }
};

export const getInvoice = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.getInvoice(id);

    if (!result) {
      return ctx.json(errorResponse('Invoice not found', '404'));
    }

    return ctx.json(successResponse(result, 'Invoice fetched successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch Invoice'), 500);
  }
};

export const updateInvoice = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));

    const body = await parseRequest(ctx);
    const payload = updateInvoiceSchema.parse(body);

    const result = await service.updateInvoice(id, payload);

    return ctx.json(successResponse(result, 'Invoice updated successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to update Invoice'), 500);
  }
};

export const deleteInvoice = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.deleteInvoice(id);

    return ctx.json(successResponse(result, 'Invoice deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete Invoice'), 500);
  }
};

export const deleteAllInvoices = async (ctx: Context) => {
  try {
    const result = await service.deleteAllInvoices();
    return ctx.json(successResponse(result, 'Invoices deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete Invoices'), 500);
  }
};

export const getOutstandingInvoiceByNumber = async (ctx: Context) => {
  try {
    const invoiceNo = ctx.req.param('invoiceNo');
    const result = await service.getOutstandingInvoiceByNumber(invoiceNo);

    if (result.status === 'not_found') {
      return ctx.json(errorResponse(result.message, '404'), 404);
    }

    if (result.status === 'fully_paid') {
      return ctx.json(successResponse(null, result.message));
    }

    return ctx.json(successResponse(result, 'Invoice fetched successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse('Failed to fetch invoice', '500'), 500);
  }
};
