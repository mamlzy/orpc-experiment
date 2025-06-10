import * as fs from 'fs/promises';
import { ORPCError, os } from '@orpc/server';
import type { Context } from 'hono';
import { z } from 'zod';

import { customerPicTable } from '@repo/db/model';
import {
  createCustomerPicSchema,
  getCustomerPicsSchema,
  updateCustomerPicSchema,
} from '@repo/db/schema';

import {
  errorResponse,
  successResponse,
  successResponseNew,
} from '../../helpers/response';
import * as service from '../../services/master-data/customer-pic.service';
import { bulkInsertCustomerPIC } from '../../utils/bulk-insert';

export const create = os
  .route({ method: 'POST', path: '/master-data/customer-pics' })
  .input(createCustomerPicSchema)
  .handler(async ({ input }) => {
    try {
      const createdCustomerPic = await service.createCustomerPic(input);

      if (!createdCustomerPic) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Failed to create customer pic',
        });
      }

      return successResponseNew({
        data: createdCustomerPic,
        message: 'Customer Pic created successfully',
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create customer pic',
      });
    }
  });

export const bulkInsertCustomerPics = async (c: Context) => {
  try {
    const filePath = c.get('filePath');
    if (!filePath) {
      return c.json({ error: 'File not found' }, 400);
    }

    const file = new File([await fs.readFile(filePath.path)], filePath.name);
    const result = await bulkInsertCustomerPIC(file, {
      table: customerPicTable,
      schema: createCustomerPicSchema,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Bulk insert failed' }, 500);
  }
};

export const getCustomerPics = os
  .route({ method: 'GET', path: '/master-data/customer-pics' })
  .input(getCustomerPicsSchema.optional())
  .handler(async ({ input }) => {
    try {
      const { data, pagination } = await service.getCustomerPics(input);

      return successResponseNew({
        data,
        message: 'Customer Pics fetched successfully',
        pagination,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch customer pics',
      });
    }
  });

export const getCustomerPic = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');
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

export const updateCustomerPic = os
  .route({
    method: 'PUT',
    path: '/master-data/customer-pics/{id}',
    inputStructure: 'detailed',
  })
  .input(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: updateCustomerPicSchema,
    })
  )
  .handler(async ({ input }) => {
    try {
      const updatedCustomerPic = await service.updateCustomerPic({
        id: input.params.id,
        payload: input.body,
      });

      if (!updatedCustomerPic) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Customer Pic not found',
        });
      }

      return successResponseNew({
        data: updatedCustomerPic,
        message: 'Customer Pic updated successfully',
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to update customer pic',
      });
    }
  });

export const deleteCustomerPic = os
  .route({
    method: 'DELETE',
    path: '/master-data/customer-pics/{id}',
  })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const deletedCustomerPic = await service.deleteCustomerPicById(input.id);

      if (!deletedCustomerPic) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Customer Pic not found',
        });
      }

      return successResponseNew({
        data: deletedCustomerPic,
        message: 'Customer Pic deleted successfully',
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to delete customer pic',
      });
    }
  });

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
