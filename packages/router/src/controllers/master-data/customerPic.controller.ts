import * as fs from 'fs/promises';
import type { Context } from 'hono';

import { customersPics } from '@repo/db/model';
import {
  insertCustomerPicSchema,
  updateCustomerPicSchema,
} from '@repo/db/schema';

import { errorResponse, successResponse } from '../../helpers/response';
import * as service from '../../services/master-data/customerPic.service';
import { bulkInsertCustomerPIC } from '../../utils/bulkInsert';
import { parseRequest } from '../../utils/parseRequest';

export const createCustomerPic = async (ctx: Context) => {
  try {
    const body = await parseRequest(ctx);
    const payload = insertCustomerPicSchema.parse(body);

    const result = await service.createCustomerPic(payload);
    return ctx.json(
      successResponse(result, 'Customer Pic created successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to create customer product'),
      500
    );
  }
};

export const bulkInsertCustomerPics = async (c: Context) => {
  try {
    const filePath = c.get('filePath');
    if (!filePath) {
      return c.json({ error: 'File not found' }, 400);
    }

    const file = new File([await fs.readFile(filePath.path)], filePath.name);
    const result = await bulkInsertCustomerPIC(file, {
      table: customersPics,
      schema: insertCustomerPicSchema,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Bulk insert failed' }, 500);
  }
};

export const getCustomerPics = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getCustomerPics(query);

    return ctx.json(
      successResponse(
        result.data,
        'Customer Pics fetched successfully',
        result.pagination
      )
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch customer pics'), 500);
  }
};

export const getCustomerPic = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.getCustomerPic(id);

    if (!result) {
      return ctx.json(errorResponse('Customer Pic not found', '404'));
    }

    return ctx.json(
      successResponse(result, 'Customer Pic fetched successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to fetch customer product'),
      500
    );
  }
};

export const updateCustomerPic = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));

    const body = await parseRequest(ctx);
    const payload = updateCustomerPicSchema.parse(body);

    const result = await service.updateCustomerPic(id, payload);

    return ctx.json(
      successResponse(result, 'Customer Pic updated successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to update customer product'),
      500
    );
  }
};

export const deleteCustomerPic = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.deleteCustomerPic(id);

    return ctx.json(
      successResponse(result, 'Customer Pic deleted successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to delete customer product'),
      500
    );
  }
};

export const deleteAllCustomerPics = async (ctx: Context) => {
  try {
    const result = await service.deleteAllCustomerPics();
    return ctx.json(
      successResponse(result, 'Customer Pics deleted successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to delete customer pics'),
      500
    );
  }
};
