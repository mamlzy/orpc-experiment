import * as fs from 'fs/promises';
import { ORPCError, os } from '@orpc/server';
import type { Context } from 'hono';

import { customers } from '@repo/db/model';
import { insertCustomerSchema, updateCustomerSchema } from '@repo/db/schema';

import { errorResponse, successResponse } from '../../helpers/response';
import * as service from '../../services/master-data/customer.service';
import { bulkInsert } from '../../utils/bulkInsert';
import { moveToFailed } from '../../utils/fileUpload';
import { parseRequest } from '../../utils/parseRequest';

export const createCustomer = async (ctx: Context) => {
  try {
    const body = await parseRequest(ctx);
    const filePath = ctx.get('filePath');
    if (filePath) {
      body.logo = filePath.name;
    }
    const payload = insertCustomerSchema.parse(body);

    const result = await service.createCustomer(payload);
    return ctx.json(successResponse(result, 'Customer created successfully'));
  } catch (error) {
    console.log('error', error);
    if (ctx.get('filePath')) {
      await moveToFailed(ctx.get('filePath').path);
    }
    return ctx.json(errorResponse(error, 'Failed to create customer'), 500);
  }
};

export const bulkInsertCustomers = async (c: Context) => {
  try {
    const filePath = c.get('filePath');
    if (!filePath) {
      return c.json({ error: 'File not found' }, 400);
    }

    const file = new File([await fs.readFile(filePath.path)], filePath.name);
    const result = await bulkInsert(file, {
      table: customers,
      schema: insertCustomerSchema,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Bulk insert failed' }, 500);
  }
};

export const getCustomers = os
  // .input(
  //   z.object({
  //     page: z.number().optional(),
  //     limit: z.number().optional(),
  //   })
  // )
  .handler(async () =>
    // { input }
    {
      try {
        // const result = await service.getCustomers(input);

        return { message: 'ok' };

        // return successResponse(
        //   result.data,
        //   'Customers fetched successfully',
        //   result.pagination
        // );
      } catch (error: any) {
        console.log('error', error);
        throw new ORPCError(error.message);
      }
    }
  );

export const getCustomer = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.getCustomer(id);

    if (!result) {
      return ctx.json(errorResponse('Customer not found', '404'));
    }

    return ctx.json(successResponse(result, 'Customer fetched successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch customer'), 500);
  }
};

export const updateCustomer = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));

    const body = await parseRequest(ctx);
    const filePath = ctx.get('filePath');
    if (filePath) {
      body.logo = filePath.name;
    }
    const payload = updateCustomerSchema.parse(body);

    const result = await service.updateCustomer(id, payload);

    return ctx.json(successResponse(result, 'Customer updated successfully'));
  } catch (error) {
    console.log('error', error);
    if (ctx.get('filePath')) {
      await moveToFailed(ctx.get('filePath').path);
    }
    return ctx.json(errorResponse(error, 'Failed to update customer'), 500);
  }
};

export const deleteCustomer = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.deleteCustomer(id);

    return ctx.json(successResponse(result, 'Customer deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete customer'), 500);
  }
};

export const deleteAllCustomers = async (ctx: Context) => {
  try {
    const result = await service.deleteAllCustomers();
    return ctx.json(successResponse(result, 'Customers deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete customers'), 500);
  }
};
