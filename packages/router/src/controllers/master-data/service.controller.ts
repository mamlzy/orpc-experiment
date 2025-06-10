import * as fs from 'fs/promises';
import { ORPCError, os } from '@orpc/server';
import type { Context } from 'hono';
import { z } from 'zod';

import { and, count, db, ilike, isNull, SQL } from '@repo/db';
import { serviceTable } from '@repo/db/model';
import {
  createServiceSchema,
  createServicesSchema,
  updateServiceSchema,
} from '@repo/db/schema';

import { successResponseNew } from '../../helpers/response';
import { createPagination } from '../../lib/utils';
import * as service from '../../services/master-data/service.service';
import { bulkInsert } from '../../utils/bulk-insert';

export const createService = os
  .route({ method: 'POST', path: '/master-data/services' })
  .input(createServiceSchema)
  .handler(async ({ input }) => {
    try {
      const data = await service.createService(input);

      return successResponseNew({
        data,
        message: 'Service created successfully',
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create service',
      });
    }
  });

export const createServices = os
  .route({ method: 'POST', path: '/master-data/services/many' })
  .input(createServicesSchema)
  .handler(async ({ input }) => {
    try {
      const createdService = await db
        .insert(serviceTable)
        .values(input)
        .returning();

      if (createdService.length < 1) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Failed to create services',
        });
      }

      return successResponseNew({
        data: createdService,
        message: 'Service created successfully',
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create service',
      });
    }
  });

export const bulkInsertServices = async (c: Context) => {
  try {
    const filePath = c.get('filePath');
    if (!filePath) {
      return c.json({ error: 'File not found' }, 400);
    }

    const file = new File([await fs.readFile(filePath.path)], filePath.name);
    const result = await bulkInsert(file, {
      table: serviceTable,
      schema: createServiceSchema,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Bulk insert failed' }, 500);
  }
};

export const getServices = os
  .route({ method: 'GET', path: '/master-data/services' })
  .input(
    z
      .object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        name: z.string().optional(),
      })
      .optional()
  )
  .handler(async ({ input }) => {
    try {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 10;
      const offset = (page - 1) * limit;

      const where: SQL[] = [isNull(serviceTable.deletedAt)];

      if (input?.name) {
        where.push(ilike(serviceTable.name, `%${input.name}%`));
      }

      const data = await db.query.serviceTable.findMany({
        limit,
        offset,
        where: and(...where),
      });

      const totalCount =
        (
          await db
            .select({ count: count() })
            .from(serviceTable)
            .where(and(...where))
        )[0]?.count ?? 0;

      const pagination = createPagination({
        totalCount,
        page,
        limit,
      });

      return successResponseNew({
        message: 'Service fetched successfully',
        data,
        pagination,
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch services',
      });
    }
  });

export const getService = os
  .route({ method: 'GET', path: '/master-data/services/{id}' })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    try {
      const result = await service.getServiceById(input.id);

      if (!result) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Service not found',
        });
      }

      return successResponseNew({
        data: result,
        message: 'Service fetched successfully',
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch service',
      });
    }
  });

export const updateService = os
  .route({
    method: 'PUT',
    path: '/master-data/services/{id}',
    inputStructure: 'detailed',
  })
  .input(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: updateServiceSchema,
    })
  )
  .handler(async ({ input }) => {
    try {
      const data = await service.updateService({
        id: input.params.id,
        payload: input.body,
      });

      return successResponseNew({
        data,
        message: 'Service updated successfully',
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to update service',
      });
    }
  });

export const deleteService = os
  .route({ method: 'DELETE', path: '/master-data/services/{id}' })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    try {
      const result = await service.deleteService(input.id);

      return successResponseNew({
        data: result,
        message: 'Service deleted successfully',
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to delete service',
      });
    }
  });

export const deleteAllServices = os
  .route({ method: 'DELETE', path: '/master-data/services/all' })
  .handler(async () => {
    try {
      const result = await service.deleteAllServices();

      return successResponseNew({
        data: result,
        message: 'Services deleted successfully',
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to delete services',
      });
    }
  });
