import { ORPCError, os } from '@orpc/server';
import type { Context } from 'hono';
import { z } from 'zod';

import {
  and,
  count,
  db,
  desc,
  eq,
  exists,
  getTableColumns,
  ilike,
  inArray,
  isNull,
  sql,
  SQL,
} from '@repo/db';
import {
  customerProductTable,
  customerStatusEnum,
  customerTable,
  customerTypeEnum,
  productTable,
  type CustomerProduct,
  type Product,
} from '@repo/db/model';
import {
  createCustomerSchema,
  createCustomersSchema,
  updateCustomerSchema,
} from '@repo/db/schema';

import {
  errorResponse,
  successResponse,
  successResponseNew,
} from '../../helpers/response';
import { checkSimilarRecord } from '../../lib/checkSimilarRecord';
import { createPagination } from '../../lib/utils';
import * as service from '../../services/master-data/customer.service';
import { createCustomer } from '../../services/master-data/customer.service';

export const checkSimilarityInput = os
  .route({ method: 'POST', path: '/master-data/customers/check-similarity' })
  .input(createCustomerSchema)
  .handler(async ({ input }) => {
    try {
      const similar = await checkSimilarRecord({
        table: customerTable,
        column: customerTable.name,
        input: input.name,
        threshold: 0.75,
      });

      return successResponse(similar, 'Similarity found successfully');
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to check similarity',
      });
    }
  });

export const create = os
  .route({ method: 'POST', path: '/master-data/customers' })
  .input(createCustomerSchema)
  .handler(async ({ input }) => {
    try {
      const createdCustomer = await createCustomer(input);

      if (!createdCustomer) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Failed to create customer',
        });
      }

      return successResponseNew({
        message: 'Customer created successfully',
        data: null,
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create customer',
      });
    }
  });

export const createCustomers = os
  .route({ method: 'POST', path: '/master-data/customers/many' })
  .input(createCustomersSchema)
  .handler(async ({ input }) => {
    try {
      const createdCustomers = await db
        .insert(customerTable)
        .values(input)
        .returning();

      if (createdCustomers.length < 1) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Failed to create customers',
        });
      }

      return successResponseNew({
        message: 'Customers created successfully',
        data: createdCustomers,
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create customers',
      });
    }
  });

export const getCustomers = os
  .route({ method: 'GET', path: '/master-data/customers' })
  .input(
    z
      .object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        name: z.string().optional(),
        status: z.array(z.enum(customerStatusEnum.enumValues)).optional(),
        customerType: z.array(z.enum(customerTypeEnum.enumValues)).optional(),
        productIds: z.array(z.string()).optional(),
      })
      .optional()
  )
  .handler(async ({ input }) => {
    try {
      const page = Math.max(Number(input?.page) || 1, 1);
      const limit = Math.max(Number(input?.limit) || 10, 1);
      const offset = (page - 1) * limit;

      const where: SQL[] = [isNull(customerTable.deletedAt)];

      if (input?.name) {
        where.push(ilike(customerTable.name, `%${input.name}%`));
      }

      if (input?.status?.length) {
        where.push(inArray(customerTable.status, input.status));
      }

      if (input?.customerType?.length) {
        where.push(inArray(customerTable.customerType, input.customerType));
      }

      if (input?.productIds?.length) {
        where.push(
          exists(
            db
              .select()
              .from(customerProductTable)
              .where(
                and(
                  inArray(customerProductTable.productId, input.productIds),
                  eq(customerProductTable.customerId, customerTable.id)
                )
              )
          )
        );
      }

      type CustomerProductWithProduct = CustomerProduct & {
        product: Product;
      };

      const data = await db
        .select({
          ...getTableColumns(customerTable),
          customerProducts: sql<CustomerProductWithProduct[]>`COALESCE(
            json_agg(
              json_build_object(
                'id', ${customerProductTable.id},
                'productId', ${customerProductTable.productId},
                'status', ${customerProductTable.status},
                'product', row_to_json(${productTable})
              )
            ) FILTER (WHERE ${customerProductTable.id} IS NOT NULL),
            '[]'
          )`.as('customerProducts'),
          deepeningCustomerProducts: sql<CustomerProductWithProduct[]>`COALESCE(
            json_agg(
              json_build_object(
                'id', ${customerProductTable.id},
                'productId', ${customerProductTable.productId},
                'status', ${customerProductTable.status},
                'product', row_to_json(${productTable})
              )
            ) FILTER (WHERE ${customerProductTable.id} IS NOT NULL AND ${customerProductTable.status} = 'DEEPENING'),
            '[]'
          )`.as('deepeningCustomerProducts'),
          successCustomerProducts: sql<CustomerProductWithProduct[]>`COALESCE(
            json_agg(
              json_build_object(
                'id', ${customerProductTable.id},
                'productId', ${customerProductTable.productId},
                'status', ${customerProductTable.status},
                'product', row_to_json(${productTable})
              )
            ) FILTER (WHERE ${customerProductTable.id} IS NOT NULL AND ${customerProductTable.status} = 'SUCCESS'),
            '[]'
          )`.as('successCustomerProducts'),
        })
        .from(customerTable)
        .leftJoin(
          customerProductTable,
          eq(customerProductTable.customerId, customerTable.id)
        )
        .leftJoin(
          productTable,
          eq(customerProductTable.productId, productTable.id)
        )
        .limit(limit)
        .offset(offset)
        .groupBy(customerTable.id)
        .where(and(...where))
        .orderBy(desc(customerTable.createdAt));

      const totalCount =
        (
          await db
            .select({ count: count() })
            .from(customerTable)
            .where(and(...where))
        )[0]?.count ?? 0;

      const pagination = createPagination({
        page,
        limit,
        totalCount,
      });

      return successResponseNew({
        message: 'Customers fetched successfully',
        data,
        pagination,
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch customers',
      });
    }
  });

export const getCustomer = os
  .route({ method: 'GET', path: '/master-data/customers/{id}' })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await service.getCustomer(input.id);

      if (!result) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Customer not found',
        });
      }

      return successResponseNew({
        message: 'Customer fetched successfully',
        data: result,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch customer',
      });
    }
  });

export const updateById = os
  .route({
    method: 'PUT',
    path: '/master-data/customers/{id}',
    inputStructure: 'detailed',
  })
  .input(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: updateCustomerSchema,
    })
  )
  .handler(async ({ input }) => {
    try {
      const updatedCustomer = await service.updateCustomer({
        id: input.params.id,
        payload: input.body,
      });

      if (!updatedCustomer.length) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Customer not found',
        });
      }

      return successResponseNew({
        message: 'Customer updated successfully',
        data: updatedCustomer,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to update customer',
      });
    }
  });

export const deleteById = os
  .route({ method: 'DELETE', path: '/master-data/customers/{id}' })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      await service.deleteCustomer(input.id);

      return successResponseNew({
        message: 'Customer deleted successfully',
        data: null,
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to delete customer',
      });
    }
  });

export const deleteAllCustomers = async (ctx: Context) => {
  try {
    const result = await service.deleteAllCustomers();
    return ctx.json(successResponse(result, 'Customers deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete customers'), 500);
  }
};
