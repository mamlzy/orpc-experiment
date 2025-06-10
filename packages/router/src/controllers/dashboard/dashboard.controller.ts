import { ORPCError, os } from '@orpc/server';
import type { Context } from 'hono';
import { z } from 'zod';

import { customerTypeEnum } from '@repo/db/model';

import {
  errorResponse,
  successResponse,
  successResponseNew,
} from '../../helpers/response';
import { createPagination } from '../../lib/utils';
import * as service from '../../services/dashboard/dashboard.service';

export const getTotalCustomer = os
  .input(
    z.object({
      customerType: z.enum(customerTypeEnum.enumValues).optional(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await service.getTotalCustomer(input);

      return successResponse(result, 'Success get total customer');
    } catch (error) {
      console.error('error => ', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to get total customer',
      });
    }
  });

export const getTotalRevenue = os
  .input(
    z.object({
      customerType: z.enum(customerTypeEnum.enumValues).optional(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = service.getTotalRevenue(input);
      return successResponse(result, 'Success get total revenue');
    } catch (error) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to get total revenue',
      });
    }
  });

export const getTotalCustomerByCountry = os
  .input(
    z.object({
      customerType: z.enum(customerTypeEnum.enumValues).optional(),
      page: z.coerce.number().optional().default(1),
      limit: z.coerce.number().optional().default(10),
    })
  )
  .handler(async ({ input }) => {
    try {
      const { data, totalCount } =
        await service.getTotalCustomerByCountry(input);

      const pagination = createPagination({
        totalCount,
        page: input.page,
        limit: input.limit,
      });

      return successResponseNew({
        data,
        pagination,
        message: 'Success get total customer by country',
      });
    } catch (error) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to get total customer by country',
      });
    }
  });

export const getRecentClosing = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getRecentClosing(query);
    return ctx.json(
      successResponse(result, 'Success get total recent closing')
    );
  } catch (error) {
    return ctx.json(errorResponse(error, 'Failed to get recent closing'), 500);
  }
};

export const getTotalCustomerBySector = os
  .input(
    z.object({
      customerType: z.enum(customerTypeEnum.enumValues).optional(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await service.getTotalCustomerBySector(input);

      return successResponse(result, 'Success get total customer by sector');
    } catch (error) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to get total customer by sector',
      });
    }
  });

export const getTotalPicCustomer = os.handler(async () => {
  try {
    const data = await service.getTotalPicCustomer();

    const sortedData = data.sort((a, b) => b.total - a.total);

    return successResponseNew({
      data: sortedData,
      message: 'Success get total pic customer',
    });
  } catch (error) {
    console.error('error => ', error);
    throw new ORPCError('INTERNAL_SERVER_ERROR', {
      message: 'Failed to get total pic customer',
    });
  }
});
