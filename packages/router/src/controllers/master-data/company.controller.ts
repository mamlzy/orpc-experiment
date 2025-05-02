import * as fs from 'fs/promises';
import type { Context } from 'hono';

import { companies } from '@repo/db/model';
import { insertCompanySchema, updateCompanySchema } from '@repo/db/schema';

import { errorResponse, successResponse } from '../../helpers/response';
import * as service from '../../services/master-data/company.service';
import { bulkInsert } from '../../utils/bulkInsert';
import { moveToFailed } from '../../utils/fileUpload';
import { parseRequest } from '../../utils/parseRequest';

export const createCompany = async (ctx: Context) => {
  try {
    const body = await parseRequest(ctx);
    const filePath = ctx.get('filePath');
    if (filePath) {
      body.logo = filePath.name;
    }
    const payload = insertCompanySchema.parse(body);

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
      table: companies,
      schema: insertCompanySchema,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Bulk insert failed' }, 500);
  }
};

export const getCompanies = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getCompanies(query);

    return ctx.json(
      successResponse(
        result.data,
        'Companies fetched successfully',
        result.pagination
      )
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch companies'), 500);
  }
};

export const getCompany = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));
    const result = await service.getCompany(id);

    if (!result) {
      return ctx.json(errorResponse('Company not found', '404'));
    }

    return ctx.json(successResponse(result, 'Company fetched successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch company'), 500);
  }
};

export const updateCompany = async (ctx: Context) => {
  try {
    const id = Number(ctx.req.param('id'));

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
    const id = Number(ctx.req.param('id'));
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
