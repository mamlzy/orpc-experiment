import type { Context } from 'hono';

import { insertRoleSchema, updateRoleSchema } from '@repo/db/schema';

import { errorResponse, successResponse } from '../../helpers/response';
import * as service from '../../services/setting/role.service';
import { moveToFailed } from '../../utils/file-upload';
import { parseRequest } from '../../utils/parse-request';

export const getRoles = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getRoles(query);

    return ctx.json(
      successResponse(
        result.data,
        'Roles fetched successfully',
        result.pagination
      )
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch roles'), 500);
  }
};

export const getRole = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');
    const result = await service.getRole(id);

    if (!result) {
      return ctx.json(errorResponse('Role not found', '404'));
    }

    return ctx.json(successResponse(result, 'Role fetched successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch role'), 500);
  }
};

export const createRole = async (ctx: Context) => {
  try {
    const body = await parseRequest(ctx);
    const filePath = ctx.get('filePath');
    if (filePath) {
      body.logo = filePath.name;
    }
    const payload = insertRoleSchema.parse(body);

    const result = await service.createRole(payload);
    return ctx.json(successResponse(result, 'Role created successfully'));
  } catch (error) {
    console.log('error', error);
    if (ctx.get('filePath')) {
      await moveToFailed(ctx.get('filePath').path);
    }
    return ctx.json(errorResponse(error, 'Failed to create role'), 500);
  }
};

export const updateRole = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');
    const payload = updateRoleSchema.parse(await ctx.req.json());

    const result = await service.updateRole(id, payload);

    return ctx.json(successResponse(result, 'Role updated successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to update role'), 500);
  }
};

export const deleteRole = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');
    const result = await service.deleteRole(id);

    return ctx.json(successResponse(result, 'Role deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete role'), 500);
  }
};

export const deleteAllRoles = async (ctx: Context) => {
  try {
    const result = await service.deleteAllRoles();
    return ctx.json(successResponse(result, 'Roles deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete roles'), 500);
  }
};
