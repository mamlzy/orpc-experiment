import * as fs from 'fs/promises';
import type { Context } from 'hono';

import { services } from '@repo/db/model';
import { insertServiceSchema, updateServiceSchema } from '@repo/db/schema';

import { errorResponse, successResponse } from '../../helpers/response';
import * as service from '../../services/master-data/service.service';
import { bulkInsert } from '../../utils/bulkInsert';
import { parseRequest } from '../../utils/parseRequest';

export const createService = async (ctx: Context) => {
  try {
    const body = await parseRequest(ctx);
    const payload = insertServiceSchema.parse(body);

    const result = await service.createService(payload);
    return ctx.json(successResponse(result, 'Service created successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to create service'), 500);
  }
};

export const bulkInsertServices = async (c: Context) => {
  try {
    const filePath = c.get('filePath');
    if (!filePath) {
      return c.json({ error: 'File not found' }, 400);
    }

    const file = new File([await fs.readFile(filePath.path)], filePath.name);
    const result = await bulkInsert(file, {
      table: services,
      schema: insertServiceSchema,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Bulk insert failed' }, 500);
  }
};

export const getServices = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getServices(query);

    return ctx.json(
      successResponse(
        result.data,
        'Services fetched successfully',
        result.pagination
      )
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch services'), 500);
  }
};

export const getService = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.getService(id);

    if (!result) {
      return ctx.json(errorResponse('Service not found', '404'));
    }

    return ctx.json(successResponse(result, 'Service fetched successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch service'), 500);
  }
};

export const updateService = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));

    const body = await parseRequest(ctx);
    const payload = updateServiceSchema.parse(body);

    const result = await service.updateService(id, payload);

    return ctx.json(successResponse(result, 'Service updated successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to update service'), 500);
  }
};

export const deleteService = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.deleteService(id);

    return ctx.json(successResponse(result, 'Service deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete service'), 500);
  }
};

export const deleteAllServices = async (ctx: Context) => {
  try {
    const result = await service.deleteAllServices();
    return ctx.json(successResponse(result, 'Services deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete services'), 500);
  }
};
