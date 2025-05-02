import * as fs from 'fs/promises';
import type { Context } from 'hono';

import { customersProducts } from '@repo/db/model';
import {
  insertCustomerProductSchema,
  updateCustomerProductSchema,
} from '@repo/db/schema';

import { errorResponse, successResponse } from '../../helpers/response';
import * as service from '../../services/master-data/customerProduct.service';
import { bulkInsert } from '../../utils/bulkInsert';
import { parseRequest } from '../../utils/parseRequest';

export const createCustomerProduct = async (ctx: Context) => {
  try {
    const body = await parseRequest(ctx);
    const payload = insertCustomerProductSchema.parse(body);

    const result = await service.createCustomerProduct(payload);
    return ctx.json(
      successResponse(result, 'Customer Product created successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to create customer product'),
      500
    );
  }
};

export const bulkInsertCustomerProducts = async (c: Context) => {
  try {
    const filePath = c.get('filePath');
    if (!filePath) {
      return c.json({ error: 'File not found' }, 400);
    }

    const file = new File([await fs.readFile(filePath.path)], filePath.name);
    const result = await bulkInsert(file, {
      table: customersProducts,
      schema: insertCustomerProductSchema,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Bulk insert failed' }, 500);
  }
};

export const getCustomerProducts = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getCustomerProducts(query);

    return ctx.json(
      successResponse(
        result.data,
        'Customer Products fetched successfully',
        result.pagination
      )
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to fetch customer products'),
      500
    );
  }
};

export const getCustomerProduct = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.getCustomerProduct(id);

    if (!result) {
      return ctx.json(errorResponse('Customer Product not found', '404'));
    }

    return ctx.json(
      successResponse(result, 'Customer Product fetched successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to fetch customer product'),
      500
    );
  }
};

export const updateCustomerProduct = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));

    const body = await parseRequest(ctx);
    const payload = updateCustomerProductSchema.parse(body);

    const result = await service.updateCustomerProduct(id, payload);

    return ctx.json(
      successResponse(result, 'Customer Product updated successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to update customer product'),
      500
    );
  }
};

export const deleteCustomerProduct = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.deleteCustomerProduct(id);

    return ctx.json(
      successResponse(result, 'Customer Product deleted successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to delete customer product'),
      500
    );
  }
};

export const deleteAllCustomerProducts = async (ctx: Context) => {
  try {
    const result = await service.deleteAllCustomerProducts();
    return ctx.json(
      successResponse(result, 'Customer Products deleted successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(
      errorResponse(error, 'Failed to delete customer products'),
      500
    );
  }
};
