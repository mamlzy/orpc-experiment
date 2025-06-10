import { ORPCError, os } from '@orpc/server';
import { z } from 'zod';

import {
  and,
  count,
  db,
  eq,
  getTableColumns,
  ilike,
  inArray,
  isNull,
  SQL,
} from '@repo/db';
import { customerTable, invoiceStatusEnum, invoiceTable } from '@repo/db/model';
import {
  createInvoiceSchema,
  createInvoicesSchema,
  updateInvoiceSchema,
} from '@repo/db/schema';

import { successResponseNew } from '../../helpers/response';
import { createPagination } from '../../lib/utils';
import * as service from '../../services/ar/invoice.service';

export const createInvoice = os
  .route({ method: 'POST', path: '/ar/invoices' })
  .input(createInvoiceSchema)
  .handler(async ({ input }) => {
    try {
      const createdInvoice = await service.createInvoice(input);

      if (!createdInvoice) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Failed to create invoice',
        });
      }

      return successResponseNew({
        message: 'Invoice created successfully',
        data: createdInvoice,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create invoice',
      });
    }
  });

export const createInvoices = os
  .route({ method: 'POST', path: '/ar/invoices/many' })
  .input(createInvoicesSchema)
  .handler(async ({ input }) => {
    try {
      const createdInvoices = await db
        .insert(invoiceTable)
        .values(input)
        .returning();

      if (createdInvoices.length < 1) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Failed to create invoices',
        });
      }

      return successResponseNew({
        message: 'Invoices created successfully',
        data: createdInvoices,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to create invoices',
      });
    }
  });

export const getInvoices = os
  .route({ method: 'GET', path: '/ar/invoices' })
  .input(
    z
      .object({
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        invoiceNo: z.string().optional(),
        customerId: z.string().optional(),
        status: z.array(z.enum(invoiceStatusEnum.enumValues)).optional(),
      })
      .optional()
  )
  .handler(async ({ input }) => {
    try {
      const page = Math.max(Number(input?.page) || 1, 1);
      const limit = Math.max(Number(input?.limit) || 10, 1);
      const offset = (page - 1) * limit;

      const where: SQL[] = [isNull(invoiceTable.deletedAt)];

      if (input?.invoiceNo) {
        where.push(ilike(invoiceTable.invoiceNo, `%${input.invoiceNo}%`));
      }

      if (input?.customerId) {
        where.push(ilike(invoiceTable.customerId, `%${input.customerId}%`));
      }

      if (input?.status?.length) {
        where.push(inArray(invoiceTable.status, input.status));
      }

      const data = await db
        .select({
          ...getTableColumns(invoiceTable),
          customerName: customerTable.name,
        })
        .from(invoiceTable)
        .leftJoin(customerTable, eq(invoiceTable.customerId, customerTable.id))
        .limit(limit)
        .offset(offset)
        .groupBy(invoiceTable.id, customerTable.name)
        .where(and(...where));

      const totalCount =
        (
          await db
            .select({ count: count() })
            .from(invoiceTable)
            .where(and(...where))
        )[0]?.count ?? 0;

      const pagination = createPagination({
        page,
        limit,
        totalCount,
      });

      return successResponseNew({
        message: 'Invoices fetched successfully',
        data,
        pagination,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch invoices',
      });
    }
  });

export const getInvoice = os
  .route({ method: 'GET', path: '/ar/invoices/{id}' })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await service.getInvoice(input.id);

      if (!result) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Invoice not found',
        });
      }

      return successResponseNew({
        message: 'Invoice fetched successfully',
        data: result,
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch invoice',
      });
    }
  });

export const updateInvoice = os
  .route({ method: 'PUT', path: '/ar/invoices/{id}' })
  .input(z.object({ id: z.string() }).merge(updateInvoiceSchema))
  .handler(async ({ input }) => {
    try {
      const result = await service.updateInvoice(input.id, input);
      return successResponseNew({
        message: 'Invoice updated successfully',
        data: { result },
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to update invoice',
      });
    }
  });

export const deleteInvoice = os
  .route({ method: 'DELETE', path: '/ar/invoices/{id}' })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const result = await service.deleteInvoice(input.id);
      return successResponseNew({
        message: 'Invoice deleted successfully',
        data: { result },
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to delete invoice',
      });
    }
  });

export const deleteAllInvoices = os
  .route({ method: 'DELETE', path: '/ar/invoices' })
  .handler(async () => {
    try {
      const result = await service.deleteAllInvoices();
      return successResponseNew({
        message: 'Invoices deleted successfully',
        data: { result },
      });
    } catch (error) {
      console.log('error', error);

      if (error instanceof ORPCError) {
        throw error;
      }

      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to delete invoices',
      });
    }
  });
