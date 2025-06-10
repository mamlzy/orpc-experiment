import * as fs from 'fs/promises';
import { ORPCError, os } from '@orpc/server';
import type { Context } from 'hono';
import { z } from 'zod';

import { and, count, db, eq, ilike, inArray, isNull, SQL } from '@repo/db';
import {
  customerProductStatusEnum,
  customerProductTable,
  customerTable,
  productTable,
} from '@repo/db/model';
import {
  createCustomerProductSchema,
  createCustomerProductsSchema,
  manageCustomerProductsSchema,
  updateCustomerProductSchema,
} from '@repo/db/schema';

import {
  errorResponse,
  successResponse,
  successResponseNew,
} from '../../helpers/response';
import * as service from '../../services/master-data/customer-product.service';
import { bulkInsert } from '../../utils/bulk-insert';
import { parseRequest } from '../../utils/parse-request';

export const createCustomerProduct = os
  .route({ method: 'POST', path: '/master-data/customer-products' })
  .input(createCustomerProductSchema)
  .handler(async ({ input }) => {
    try {
      const result = await service.createCustomerProduct(input);

      return successResponseNew({
        message: 'Customer Product created successfully',
        data: result,
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create customer product',
      });
    }
  });

export const createCustomerProducts = os
  .route({ method: 'POST', path: '/master-data/customer-products/many' })
  .input(createCustomerProductsSchema)
  .handler(async ({ input }) => {
    try {
      const createdProducts = await db
        .insert(customerProductTable)
        .values(input)
        .returning();

      if (createdProducts.length < 1) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to create customer products',
        });
      }

      return successResponseNew({
        message: 'Customer Products created successfully',
        data: createdProducts,
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create customer products',
      });
    }
  });

export const bulkInsertCustomerProducts = async (c: Context) => {
  try {
    const filePath = c.get('filePath');
    if (!filePath) {
      return c.json({ error: 'File not found' }, 400);
    }

    const file = new File([await fs.readFile(filePath.path)], filePath.name);
    const result = await bulkInsert(file, {
      table: customerProductTable,
      schema: createCustomerProductSchema,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Bulk insert failed' }, 500);
  }
};

export const getCustomerProducts = os
  .route({ method: 'GET', path: '/master-data/customer-products' })
  .input(
    z
      .object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        productId: z.string().optional(),
        customerName: z.string().optional(),
        status: z
          .array(z.enum(customerProductStatusEnum.enumValues))
          .optional(),
      })
      .optional()
  )
  .handler(async ({ input }) => {
    try {
      const page = Math.max(Number(input?.page) || 1, 1);
      const limit = Math.max(Number(input?.limit) || 10, 1);
      const offset = (page - 1) * limit;

      const where: SQL[] = [isNull(customerProductTable.deletedAt)];

      if (input?.productId) {
        where.push(eq(customerProductTable.productId, input.productId));
      }

      if (input?.customerName) {
        where.push(ilike(customerTable.name, `%${input.customerName}%`));
      }

      if (input?.status?.length) {
        where.push(inArray(customerProductTable.status, input.status));
      }

      const data = await db
        .select({
          id: customerProductTable.id,
          productName: productTable.name,
          customerName: customerTable.name,
          status: customerProductTable.status,
          product: productTable,
          customer: customerTable,
        })
        .from(customerProductTable)
        .innerJoin(
          productTable,
          eq(productTable.id, customerProductTable.productId)
        )
        .innerJoin(
          customerTable,
          eq(customerTable.id, customerProductTable.customerId)
        )
        .where(and(...where))
        .offset(offset)
        .limit(limit);

      const total =
        (
          await db
            .select({ count: count() })
            .from(customerProductTable)
            .innerJoin(
              productTable,
              eq(productTable.id, customerProductTable.productId)
            )
            .innerJoin(
              customerTable,
              eq(customerTable.id, customerProductTable.customerId)
            )
            .where(and(...where))
        )[0]?.count ?? 0;

      return successResponse(data, 'Customer Products fetched successfully', {
        pageCount: Math.ceil(Number(total) / limit),
        total: Number(total),
        pageIndex: page,
        pageSize: limit,
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch customer products',
      });
    }
  });

export const getCustomerProduct = os
  .route({ method: 'GET', path: '/master-data/customer-products/{id}' })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    try {
      const result = await service.getCustomerProduct(input.id);

      if (!result) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Customer Product not found',
        });
      }

      return successResponse(result, 'Customer Product fetched successfully');
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch customer product',
      });
    }
  });

export const updateCustomerProduct = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');

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
    const id = ctx.req.param('id');
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

export const manageCustomerProducts = os
  .route({ method: 'POST', path: '/master-data/customer-products/manage' })
  .input(manageCustomerProductsSchema)
  .handler(async ({ input }) => {
    try {
      await service.manageCustomerProducts(input);

      return successResponseNew({
        message: 'Customer Products managed successfully',
        data: null,
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to manage customer products',
      });
    }
  });
