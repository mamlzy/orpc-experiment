import * as fs from 'fs/promises';
import type { Context } from 'hono';

import { salesSummaryTable } from '@repo/db/model';
import {
  insertSalesSummarySchema,
  updateSalesSummarySchema,
} from '@repo/db/schema';

import { errorResponse, successResponse } from '../../helpers/response';
import * as service from '../../services/sales/sales-summary.service';
import { bulkInsert } from '../../utils/bulk-insert';
import { parseRequest } from '../../utils/parse-request';

export const createSalesSummary = async (ctx: Context) => {
  try {
    const body = await parseRequest(ctx);
    const payload = insertSalesSummarySchema.parse(body);

    const result = await service.createSalesSummary(payload);
    return ctx.json(
      successResponse(result, 'Sales Summary created successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to create Sales Summary'),
      500
    );
  }
};

export const bulkInsertSalesSummaries = async (c: Context) => {
  try {
    const filePath = c.get('filePath');
    if (!filePath) {
      return c.json({ error: 'File not found' }, 400);
    }

    const file = new File([await fs.readFile(filePath.path)], filePath.name);
    const result = await bulkInsert(file, {
      table: salesSummaryTable,
      schema: insertSalesSummarySchema,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Bulk insert failed' }, 500);
  }
};

export const getSalesSummaries = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getSalesSummaries(query);

    return ctx.json(
      successResponse(
        result.data,
        'Sales Summaries fetched successfully',
        result.pagination
      )
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to fetch Sales Summaries'),
      500
    );
  }
};

export const getSalesSummary = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');
    const result = await service.getSalesSummary(id);

    if (!result) {
      return ctx.json(errorResponse('Sales Summary not found', '404'));
    }

    return ctx.json(
      successResponse(result, 'Sales Summary fetched successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch Sales Summary'), 500);
  }
};

export const updateSalesSummary = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');

    const body = await parseRequest(ctx);
    const payload = updateSalesSummarySchema.parse(body);

    const result = await service.updateSalesSummary(id, payload);

    return ctx.json(
      successResponse(result, 'Sales Summary updated successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to update Sales Summary'),
      500
    );
  }
};

export const deleteSalesSummary = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');
    const result = await service.deleteSalesSummary(id);

    return ctx.json(
      successResponse(result, 'Sales Summary deleted successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to delete Sales Summary'),
      500
    );
  }
};

export const deleteAllSalesSummaries = async (ctx: Context) => {
  try {
    const result = await service.deleteAllSalesSummaries();
    return ctx.json(
      successResponse(result, 'Sales Summaries deleted successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to delete Sales Summaries'),
      500
    );
  }
};
