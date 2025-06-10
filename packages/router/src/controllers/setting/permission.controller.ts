import type { Context } from 'hono';

import {
  insertPermissionSchema,
  updatePermissionSchema,
} from '@repo/db/schema';

import { errorResponse, successResponse } from '../../helpers/response';
import * as service from '../../services/setting/permission.service';
import { moveToFailed } from '../../utils/file-upload';
import { parseRequest } from '../../utils/parse-request';

export const getPermissions = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getPermissions(query);

    return ctx.json(
      successResponse(
        result.data,
        'Permissions fetched successfully',
        result.pagination
      )
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch permissions'), 500);
  }
};

export const getPermission = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');
    const result = await service.getPermission(id);

    if (!result) {
      return ctx.json(errorResponse('Permission not found', '404'));
    }

    return ctx.json(successResponse(result, 'Permission fetched successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch permission'), 500);
  }
};

export const createPermission = async (ctx: Context) => {
  try {
    const body = await parseRequest(ctx);
    const filePath = ctx.get('filePath');
    if (filePath) {
      body.logo = filePath.name;
    }
    const payload = insertPermissionSchema.parse(body);

    const result = await service.createPermission(payload);
    return ctx.json(successResponse(result, 'Permission created successfully'));
  } catch (error) {
    console.log('error', error);
    if (ctx.get('filePath')) {
      await moveToFailed(ctx.get('filePath').path);
    }
    return ctx.json(errorResponse(error, 'Failed to create permission'), 500);
  }
};

export const updatePermission = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');
    const payload = updatePermissionSchema.parse(await ctx.req.json());

    const result = await service.updatePermission(id, payload);

    return ctx.json(successResponse(result, 'Permission updated successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to update permission'), 500);
  }
};

export const deletePermission = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');
    const result = await service.deletePermission(id);

    return ctx.json(successResponse(result, 'Permission deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete permission'), 500);
  }
};

export const deleteAllPermissions = async (ctx: Context) => {
  try {
    const result = await service.deleteAllPermissions();
    return ctx.json(
      successResponse(result, 'Permissions deleted successfully')
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete permissions'), 500);
  }
};
