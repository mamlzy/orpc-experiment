import { ORPCError, os } from '@orpc/server';
import { z } from 'zod';

import {
  and,
  count,
  db,
  eq,
  getTableColumns,
  ilike,
  isNull,
  SQL,
} from '@repo/db';
import { bankAccountTable } from '@repo/db/model';
import {
  createBankAccountSchema,
  updateBankAccountSchema,
} from '@repo/db/schema';

import { successResponseNew } from '../../helpers/response';
import { createPagination } from '../../lib/utils';
import * as service from '../../services/setting/bank-account.service';

export const createBankAccount = os
  .route({ method: 'POST', path: '/setting/bank-accounts' })
  .input(createBankAccountSchema)
  .handler(async ({ input }) => {
    try {
      const createdBankAccount = await service.createBankAccount(input);

      if (!createdBankAccount) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Failed to create bank account',
        });
      }

      return successResponseNew({
        message: 'Bank account created successfully',
        data: null,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create bank account',
      });
    }
  });

export const getBankAccounts = os
  .route({ method: 'GET', path: '/setting/bank-accounts' })
  .input(
    z
      .object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        bankName: z.string().optional(),
        accountName: z.string().optional(),
        accountNumber: z.string().optional(),
        isActive: z
          .string()
          .transform((val) => {
            if (val === 'true' || val === '1') return true;
            if (val === 'false' || val === '0') return false;
            throw new Error('Invalid boolean');
          })
          .optional(),
      })
      .optional()
  )
  .handler(async ({ input }) => {
    try {
      const page = Math.max(Number(input?.page) || 1, 1);
      const limit = Math.max(Number(input?.limit) || 10, 1);
      const offset = (page - 1) * limit;

      const where: SQL[] = [isNull(bankAccountTable.deletedAt)];

      if (input?.bankName) {
        where.push(ilike(bankAccountTable.bankName, `%${input.bankName}%`));
      }

      if (input?.accountName) {
        where.push(
          ilike(bankAccountTable.accountName, `%${input.accountName}%`)
        );
      }

      if (input?.accountNumber) {
        where.push(
          ilike(bankAccountTable.accountNumber, `%${input.accountNumber}%`)
        );
      }

      if (typeof input?.isActive === 'boolean') {
        where.push(eq(bankAccountTable.isActive, input.isActive));
      }

      const data = await db
        .select({
          ...getTableColumns(bankAccountTable),
        })
        .from(bankAccountTable)
        .limit(limit)
        .offset(offset)
        .groupBy(bankAccountTable.id)
        .where(and(...where));

      const totalCount =
        (
          await db
            .select({ count: count() })
            .from(bankAccountTable)
            .where(and(...where))
        )[0]?.count ?? 0;

      const pagination = createPagination({
        page,
        limit,
        totalCount,
      });

      return successResponseNew({
        message: 'Bank accounts fetched successfully',
        data,
        pagination,
      });
    } catch (error) {
      console.log('error', error);

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch bank accounts',
      });
    }
  });

export const getBankAccount = os
  .route({ method: 'GET', path: '/setting/bank-accounts/{id}' })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await service.getBankAccount(input.id);

      if (!result) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Bank account not found',
        });
      }

      return successResponseNew({
        message: 'Bank account fetched successfully',
        data: result,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch bank account',
      });
    }
  });

export const updateBankAccount = os
  .route({ method: 'PUT', path: '/setting/bank-accounts/{id}' })
  .input(z.object({ id: z.string() }).merge(updateBankAccountSchema))
  .handler(async ({ input }) => {
    try {
      const updatedBankAccount = await service.updateBankAccount(
        input.id,
        input
      );
      return successResponseNew({
        message: 'Bank account updated successfully',
        data: updatedBankAccount,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to update bank account',
      });
    }
  });

export const deleteBankAccount = os
  .route({ method: 'DELETE', path: '/setting/bank-accounts/{id}' })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await service.deleteBankAccount(input.id);
      return successResponseNew({
        message: 'Bank account deleted successfully',
        data: { result },
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to delete bank account',
      });
    }
  });

export const deleteAllBankAccounts = os
  .route({ method: 'DELETE', path: '/setting/bank-accounts' })
  .handler(async () => {
    try {
      const result = await service.deleteAllBankAccounts();
      return successResponseNew({
        message: 'Bank accounts deleted successfully',
        data: { result },
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to delete bank accounts',
      });
    }
  });
