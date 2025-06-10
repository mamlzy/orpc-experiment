import { ORPCError, os } from '@orpc/server';
import { z } from 'zod';

import { and, count, db, getTableColumns, ilike, isNull, SQL } from '@repo/db';
import { paymentTable } from '@repo/db/model';
import {
  insertPaymentSchema,
  insertPaymentsSchema,
  updatePaymentSchema,
} from '@repo/db/schema';

import { successResponseNew } from '../../helpers/response';
import { createPagination } from '../../lib/utils';
import * as service from '../../services/ar/payment.service';

export const createPayment = os
  .route({ method: 'POST', path: '/ar/payments' })
  .input(insertPaymentSchema)
  .handler(async ({ input }) => {
    try {
      const createdPayment = await service.createPayment(input);

      if (!createdPayment) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Failed to create payment',
        });
      }

      return successResponseNew({
        message: 'Payment created successfully',
        data: createdPayment,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create payment',
      });
    }
  });

export const createPayments = os
  .route({ method: 'POST', path: '/ar/payments/multiple' })
  .input(insertPaymentsSchema)
  .handler(async ({ input }) => {
    try {
      const transformed = input.map((payment) => {
        return {
          paymentNumber: payment.paymentNumber,
          date: payment.date,
          customerId: payment.customerId,
          paymentMethod: payment.paymentMethod,
          bankAccount: payment.bankAccount ?? null,
          bankNumber: payment.bankNumber ?? null,
          totalPaid: payment.totalPaid.toFixed(2),
        };
      });

      const createdPayments = await db
        .insert(paymentTable)
        .values(transformed)
        .returning();

      if (createdPayments.length < 1) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Failed to create payments',
        });
      }

      return successResponseNew({
        message: 'Payments created successfully',
        data: createdPayments,
      });
    } catch (error) {
      console.error('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create payments',
      });
    }
  });

export const getPayments = os
  .route({ method: 'GET', path: '/ar/payments' })
  .input(
    z
      .object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        paymentNumber: z.string().optional(),
        customerId: z.string().optional(),
      })
      .optional()
  )
  .handler(async ({ input }) => {
    try {
      const page = Math.max(Number(input?.page) || 1, 1);
      const limit = Math.max(Number(input?.limit) || 10, 1);
      const offset = (page - 1) * limit;

      const where: SQL[] = [isNull(paymentTable.deletedAt)];

      if (input?.paymentNumber) {
        where.push(
          ilike(paymentTable.paymentNumber, `%${input.paymentNumber}%`)
        );
      }

      if (input?.customerId) {
        where.push(ilike(paymentTable.customerId, `%${input.customerId}%`));
      }

      const data = await db
        .select({
          ...getTableColumns(paymentTable),
        })
        .from(paymentTable)
        .limit(limit)
        .offset(offset)
        .where(and(...where));

      const totalCount =
        (
          await db
            .select({ count: count() })
            .from(paymentTable)
            .where(and(...where))
        )[0]?.count ?? 0;

      const pagination = createPagination({
        page,
        limit,
        totalCount,
      });

      return successResponseNew({
        message: 'Payments fetched successfully',
        data,
        pagination,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch payments',
      });
    }
  });

export const getPayment = os
  .route({ method: 'GET', path: '/ar/payments/{id}' })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await service.getPayment(input.id);

      if (!result) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Payment not found',
        });
      }

      return successResponseNew({
        message: 'Payment fetched successfully',
        data: result,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch payment',
      });
    }
  });

export const updatePayment = os
  .route({ method: 'PUT', path: '/ar/payments/{id}' })
  .input(z.object({ id: z.string() }).merge(updatePaymentSchema))
  .handler(async ({ input }) => {
    try {
      const result = await service.updatePayment(input.id, input);
      return successResponseNew({
        message: 'Payment updated successfully',
        data: { result },
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to update payment',
      });
    }
  });

export const deletePayment = os
  .route({ method: 'DELETE', path: '/ar/payments/{id}' })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await service.deletePayment(input.id);
      return successResponseNew({
        message: 'Payment deleted successfully',
        data: { result },
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to delete payment',
      });
    }
  });

export const deleteAllPayments = os
  .route({ method: 'DELETE', path: '/ar/payments' })
  .handler(async () => {
    try {
      const result = await service.deleteAllPayments();
      return successResponseNew({
        message: 'Payments deleted successfully',
        data: { result },
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to delete payment',
      });
    }
  });
