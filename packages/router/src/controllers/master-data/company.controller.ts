import * as fs from 'fs/promises';
import { ORPCError, os } from '@orpc/server';
import type { Context } from 'hono';
import { z } from 'zod';

import { companyTable } from '@repo/db/model';
import {
  createCompanySchema,
  getAllCompanyQuerySchema,
  updateCompanySchema,
} from '@repo/db/schema';

import {
  errorResponse,
  successResponse,
  successResponseNew,
} from '../../helpers/response';
import * as service from '../../services/master-data/company.service';
import { bulkInsert } from '../../utils/bulk-insert';
import { moveToFailed } from '../../utils/file-upload';
import { parseRequest } from '../../utils/parse-request';

export const createCompany = async (ctx: Context) => {
  try {
    const body = await parseRequest(ctx);
    const filePath = ctx.get('filePath');
    if (filePath) {
      body.logo = filePath.name;
    }
    const payload = createCompanySchema.parse(body);

    const result = await service.createCompany(payload);
    return ctx.json(successResponse(result, 'Company created successfully'));
  } catch (error) {
    console.log('error', error);
    if (ctx.get('filePath')) {
      await moveToFailed(ctx.get('filePath').path);
    }
    return ctx.json(errorResponse(error, 'Failed to create companie'), 500);
  }
};

export const bulkInsertCompanies = async (c: Context) => {
  try {
    const filePath = c.get('filePath');
    if (!filePath) {
      return c.json({ error: 'File not found' }, 400);
    }

    const file = new File([await fs.readFile(filePath.path)], filePath.name);
    const result = await bulkInsert(file, {
      table: companyTable,
      schema: createCompanySchema,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Bulk insert failed' }, 500);
  }
};

export const getCompanies = os
  .input(getAllCompanyQuerySchema)
  .handler(async ({ input }) => {
    try {
      const { data, pagination } = await service.getCompanies(input);

      return successResponseNew({
        message: 'Companies fetched successfully',
        data,
        pagination,
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch companies',
      });
    }
  });

export const getCompany = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    try {
      const company = await service.getCompany(input.id);

      if (!company) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Company not found',
        });
      }

      return successResponseNew({
        message: 'Company fetched successfully',
        data: company,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch company',
      });
    }
  });

export const updateCompany = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');

    const body = await parseRequest(ctx);
    const filePath = ctx.get('filePath');
    if (filePath) {
      body.logo = filePath.name;
    }
    const payload = updateCompanySchema.parse(body);

    const result = await service.updateCompany(id, payload);

    return ctx.json(successResponse(result, 'Company updated successfully'));
  } catch (error) {
    console.log('error', error);
    if (ctx.get('filePath')) {
      await moveToFailed(ctx.get('filePath').path);
    }
    return ctx.json(errorResponse(error, 'Failed to update company'), 500);
  }
};

export const deleteCompany = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');
    const result = await service.deleteCompany(id);

    return ctx.json(successResponse(result, 'Company deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete company'), 500);
  }
};

export const deleteAllCompanies = async (ctx: Context) => {
  try {
    const result = await service.deleteAllCompanies();
    return ctx.json(successResponse(result, 'Companies deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete companies'), 500);
  }
};
