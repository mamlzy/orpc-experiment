import fs from 'fs/promises';
import path from 'path';
import { ORPCError } from '@orpc/server';
import { createId } from '@paralleldrive/cuid2';
import { APIError } from 'better-auth/api';
import type { Context } from 'hono';
import { z } from 'zod';

import { auth } from '@repo/auth/server';
import { db, eq } from '@repo/db';
import { userTable, type User } from '@repo/db/model';
import { getAllUsersQuerySchema, updateUserSchema } from '@repo/db/schema';

import { CWD } from '../../data/constants';
import {
  errorResponse,
  successResponse,
  successResponseNew,
} from '../../helpers/response';
import { osHono } from '../../lib/orpc';
import { authMiddleware } from '../../middlewares';
import * as service from '../../services/master-data/user.service';

export const getUsers = osHono
  .route({
    method: 'GET',
    path: '/master-data/users',
  })
  .use(authMiddleware)
  .input(getAllUsersQuerySchema.optional())
  .handler(async ({ input }) => {
    try {
      const { data, pagination } = await service.getUsers(input);

      return successResponseNew({
        data,
        message: 'Users fetched successfully',
        pagination,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch users',
      });
    }
  });

export const getUser = osHono
  .route({
    method: 'GET',
    path: '/master-data/users/{id}',
  })
  .use(authMiddleware)
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await service.getUser(input.id);

      if (!result) {
        throw new ORPCError('NOT_FOUND', {
          message: 'User not found',
        });
      }

      return successResponse(result, 'User fetched successfully');
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch user',
      });
    }
  });

export const updateUser = osHono
  .route({
    method: 'PUT',
    path: '/master-data/users/{id}',
    inputStructure: 'detailed',
  })
  .use(authMiddleware)
  .input(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: updateUserSchema,
    })
  )
  .handler(async ({ input }) => {
    const { password, imageFile, image, ...rest } = input.body;

    console.log('body => ', input.body);

    console.log('id => ', input.params.id);

    const user = await db.query.userTable.findFirst({
      where: eq(userTable.id, input.params.id),
    });

    if (!user) {
      throw new ORPCError('NOT_FOUND', {
        message: 'User not found',
      });
    }

    try {
      const updatedUser = await db.transaction(async (tx) => {
        let result: User;

        if (imageFile) {
          // Handle image upload
          // Validate file size (2MB = 2 * 1024 * 1024 bytes)
          const maxSize = 2 * 1024 * 1024; // 2MB
          if (imageFile.size > maxSize) {
            throw new ORPCError('BAD_REQUEST', {
              message: 'File size exceeds 2MB limit',
            });
          }

          // Validate file type (only images)
          const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
          ];
          if (!allowedTypes.includes(imageFile.type)) {
            throw new ORPCError('BAD_REQUEST', {
              message:
                'Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed',
            });
          }

          const fileBuffer = Buffer.from(await imageFile.arrayBuffer());

          // Extract filename without extension and file extension
          const fileExt = path.extname(imageFile.name);
          const fileNameWithoutExt = path.basename(imageFile.name, fileExt);
          const newFileName = `${fileNameWithoutExt}-${createId()}${fileExt}`;

          const uploadDir = path.join(CWD, 'public', 'pp');
          const filePath = path.join(uploadDir, newFileName);

          try {
            const updatedUser = await service.updateUserById({
              tx,
              id: user.id,
              payload: {
                ...rest,
                image: newFileName,
              },
            });

            // Ensure upload directory exists
            await fs.mkdir(uploadDir, { recursive: true });

            // Write the file
            await fs.writeFile(filePath, fileBuffer);

            if (user.image) {
              // Delete old image
              const oldFilePath = path.join(uploadDir, user.image);
              fs.unlink(oldFilePath).catch(() => {});
            }

            if (!updatedUser) {
              throw new ORPCError('NOT_FOUND', {
                message: 'User not found',
              });
            }

            result = updatedUser;
          } catch (error) {
            console.error(`Error updating image:`, error);

            throw new Error(
              `Failed to update image: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        } else if (image === null) {
          console.log('HITTTTTT');
          // Handle image removal - when image is explicitly set to undefined
          try {
            const updatedUser = await service.updateUserById({
              tx,
              id: user.id,
              payload: {
                ...rest,
                image: null,
              },
            });

            // Delete existing image file if it exists
            if (user.image) {
              const uploadDir = path.join(CWD, 'public', 'pp');
              const oldFilePath = path.join(uploadDir, user.image);
              fs.unlink(oldFilePath).catch(() => {
                console.log(
                  'Old image file not found or could not be deleted:',
                  oldFilePath
                );
              });
            }

            if (!updatedUser) {
              throw new ORPCError('NOT_FOUND', {
                message: 'User not found',
              });
            }

            result = updatedUser;
          } catch (error) {
            console.error(`Error removing image:`, error);

            throw new Error(
              `Failed to remove image: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        } else {
          // Handle other user data updates (no image changes)
          const updatedUser = await service.updateUserById({
            tx,
            id: user.id,
            payload: rest,
          });

          if (!updatedUser) {
            throw new ORPCError('NOT_FOUND', {
              message: 'User not found',
            });
          }

          result = updatedUser;
        }

        if (password) {
          const ctx = await auth.$context;
          const hash = await ctx.password.hash(password);

          await ctx.internalAdapter.updatePassword(user.id, hash);
        }

        return result;
      });

      if (!updatedUser) {
        throw new ORPCError('NOT_FOUND', {
          message: 'User not found',
        });
      }

      return successResponseNew({
        data: updatedUser,
        message: 'User updated successfully',
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof APIError) {
        throw new ORPCError('BAD_REQUEST', {
          message: error.message,
        });
      }

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to update user',
      });
    }
  });

export const deleteUser = osHono
  .route({
    method: 'DELETE',
    path: '/master-data/users/{id}',
  })
  .use(authMiddleware)
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await service.deleteUser(input.id);

      return successResponseNew({
        data: result,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to delete user',
      });
    }
  });

export const deleteAllUsers = async (ctx: Context) => {
  try {
    const result = await service.deleteAllUsers();
    return ctx.json(successResponse(result, 'Users deleted successfully'));
  } catch (error) {
    console.log('error', error);
    return ctx.json(errorResponse(error, 'Failed to delete users'), 500);
  }
};
