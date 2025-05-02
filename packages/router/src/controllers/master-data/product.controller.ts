import * as fs from 'fs/promises';
import type { Context } from 'hono';

import { products } from '@repo/db/model';
import { insertProductSchema, updateProductSchema } from '@repo/db/schema';

import { errorResponse, successResponse } from '../../helpers/response';
import * as service from '../../services/master-data/product.service';
import { bulkInsert } from '../../utils/bulkInsert';
import { moveToFailed } from '../../utils/fileUpload';
import { parseRequest } from '../../utils/parseRequest';

export const createProduct = async (ctx: Context) => {
  try {
    const body = await parseRequest(ctx);
    const filePath = ctx.get('filePath');
    if (filePath) {
      body.logo = filePath.name;
    }
    const payload = insertProductSchema.parse(body);

    const result = await service.createProduct(payload);
    return ctx.json(successResponse(result, 'Product created successfully'));
  } catch (error) {
    console.log('error', error);
    if (ctx.get('filePath')) {
      await moveToFailed(ctx.get('filePath').path);
    }
    return ctx.json(errorResponse(error, 'Failed to create product'), 500);
  }
};

export const bulkInsertProducts = async (c: Context) => {
  try {
    const filePath = c.get('filePath');
    if (!filePath) {
      return c.json({ error: 'File not found' }, 400);
    }

    const file = new File([await fs.readFile(filePath.path)], filePath.name);
    const result = await bulkInsert(file, {
      table: products,
      schema: insertProductSchema,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Bulk insert failed' }, 500);
  }
};

export const getProducts = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getProducts(query);

    return ctx.json(
      successResponse(
        result.data,
        'Products fetched successfully',
        result.pagination
      )
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch products'), 500);
  }
};

export const getProduct = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.getProduct(id);

    if (!result) {
      return ctx.json(errorResponse('Product not found', '404'));
    }

    return ctx.json(successResponse(result, 'Product fetched successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch product'), 500);
  }
};

export const updateProduct = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));

    const body = await parseRequest(ctx);
    const filePath = ctx.get('filePath');
    if (filePath) {
      body.logo = filePath.name;
    }
    const payload = updateProductSchema.parse(body);

    const result = await service.updateProduct(id, payload);

    return ctx.json(successResponse(result, 'Product updated successfully'));
  } catch (error) {
    console.log('error', error);
    if (ctx.get('filePath')) {
      await moveToFailed(ctx.get('filePath').path);
    }
    return ctx.json(errorResponse(error, 'Failed to update product'), 500);
  }
};

export const deleteProduct = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.deleteProduct(id);

    return ctx.json(successResponse(result, 'Product deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete product'), 500);
  }
};

export const deleteAllProducts = async (ctx: Context) => {
  try {
    const result = await service.deleteAllProducts();
    return ctx.json(successResponse(result, 'Products deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete products'), 500);
  }
};
