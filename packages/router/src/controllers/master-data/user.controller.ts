import type { Context } from 'hono';

import { updateUserSchema } from '@repo/db/schema';

import { errorResponse, successResponse } from '../../helpers/response';
import * as service from '../../services/master-data/user.service';
import { moveToFailed } from '../../utils/fileUpload';
import { parseRequest } from '../../utils/parseRequest';

export const getUsers = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getUsers(query);

    return ctx.json(
      successResponse(
        result.data,
        'Users fetched successfully',
        result.pagination
      )
    );
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch users'), 500);
  }
};

export const getUser = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');
    const result = await service.getUser(id);

    if (!result) {
      return ctx.json(errorResponse('User not found', '404'));
    }

    return ctx.json(successResponse(result, 'User fetched successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to fetch user'), 500);
  }
};

export const updateUser = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');

    const body = await parseRequest(ctx);
    const filePath = ctx.get('filePath');
    if (filePath) {
      body.photo = filePath.name;
    }
    const payload = updateUserSchema.parse(body);

    const result = await service.updateUser(id, payload);

    return ctx.json(successResponse(result, 'User updated successfully'));
  } catch (error) {
    console.log('error', error);
    if (ctx.get('filePath')) {
      await moveToFailed(ctx.get('filePath').path);
    }
    return ctx.json(errorResponse(error, 'Failed to update user'), 500);
  }
};

export const deleteUser = async (ctx: Context) => {
  try {
    const id = ctx.req.param('id');
    const result = await service.deleteUser(id);

    return ctx.json(successResponse(result, 'User deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete user'), 500);
  }
};

export const deleteAllUsers = async (ctx: Context) => {
  try {
    const result = await service.deleteAllUsers();
    return ctx.json(successResponse(result, 'Users deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete users'), 500);
  }
};
