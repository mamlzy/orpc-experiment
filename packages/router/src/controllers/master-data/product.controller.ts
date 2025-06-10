import { ORPCError, os } from '@orpc/server';
import type { Context } from 'hono';
import { z } from 'zod';

import { and, count, db, desc, ilike, isNull, SQL } from '@repo/db';
import { productTable } from '@repo/db/model';
import {
  createProductSchema,
  createProductsSchema,
  updateProductSchema,
} from '@repo/db/schema';

import {
  errorResponse,
  successResponse,
  successResponseNew,
} from '../../helpers/response';
import { createPagination } from '../../lib/utils';
import * as service from '../../services/master-data/product.service';

export const createProduct = os
  .route({ method: 'POST', path: '/master-data/products' })
  .input(createProductSchema)
  .handler(async ({ input }) => {
    try {
      const createdProduct = (
        await db.insert(productTable).values(input).returning()
      )[0];

      if (!createdProduct) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Failed to create product',
        });
      }

      return successResponseNew({
        data: createdProduct,
        message: 'Product created successfully',
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create product',
      });
    }
  });

export const createProducts = os
  .route({ method: 'POST', path: '/master-data/products/many' })
  .input(createProductsSchema)
  .handler(async ({ input }) => {
    try {
      const createdProduct = await db
        .insert(productTable)
        .values(input)
        .returning();

      if (createdProduct.length < 1) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Failed to create products',
        });
      }

      return successResponseNew({
        data: createdProduct,
        message: 'Product created successfully',
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create product',
      });
    }
  });

export const getProducts = os
  .route({ method: 'GET', path: '/master-data/products' })
  .input(
    z
      .object({
        page: z.coerce.number().optional().default(1),
        limit: z.coerce.number().optional().default(10),
        name: z.string().optional(),
      })
      .optional()
  )
  .handler(async ({ input }) => {
    try {
      const page = Math.max(Number(input?.page) || 1, 1);
      const limit = Math.max(Number(input?.limit) || 10, 1);
      const offset = (page - 1) * limit;

      const where: SQL[] = [isNull(productTable.deletedAt)];

      if (input?.name) {
        where.push(ilike(productTable.name, `%${input.name}%`));
      }

      const data = await db.query.productTable.findMany({
        limit,
        offset,
        where: and(...where),
        with: {
          service: {
            columns: {
              name: true,
            },
          },
        },
        orderBy: [desc(productTable.createdAt)],
      });

      const totalCount =
        (
          await db
            .select({ count: count() })
            .from(productTable)
            .where(and(...where))
        )[0]?.count ?? 0;

      const pagination = createPagination({
        totalCount,
        page,
        limit,
      });

      return successResponseNew({
        message: 'Products fetched successfully',
        data,
        pagination,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch products',
      });
    }
  });

export const getProduct = os
  .route({ method: 'GET', path: '/master-data/products/{id}' })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    try {
      const result = await service.getProduct(input.id);

      if (!result) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Product not found',
        });
      }

      return successResponse(result, 'Product fetched successfully');
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch product',
      });
    }
  });

export const updateProductById = os
  .route({
    method: 'PUT',
    path: '/master-data/products/{id}',
    inputStructure: 'detailed',
  })
  .input(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: updateProductSchema,
    })
  )
  .handler(async ({ input }) => {
    try {
      const updatedProduct = await service.updateProductById({
        id: input.params.id,
        payload: input.body,
      });

      if (!updatedProduct.length) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Product not found',
        });
      }

      return successResponseNew({
        data: updatedProduct,
        message: 'Product updated successfully',
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to update product',
      });
    }
  });

export const deleteProductById = os
  .route({ method: 'DELETE', path: '/master-data/products/{id}' })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    try {
      const deletedProduct = await service.deleteProduct(input.id);

      if (!deletedProduct.length) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Product not found',
        });
      }

      return successResponseNew({
        data: deletedProduct,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to delete product',
      });
    }
  });

export const deleteAllProducts = async (ctx: Context) => {
  try {
    const result = await service.deleteAllProducts();
    return ctx.json(successResponse(result, 'Products deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete products'), 500);
  }
};
