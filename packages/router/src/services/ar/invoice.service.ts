import { and, count, db, eq, inArray, sql } from '@repo/db';
import {
  invoices,
  invoiceTransactions,
  paymentInvoices,
  transactions,
} from '@repo/db/model';
import type { InvoiceInput, InvoiceUpdate } from '@repo/db/schema';

import { buildWhereClause } from '../../utils/whereClause';

type Invoice = typeof invoices.$inferSelect;

export const generateInvoiceNumber = async () => {
  const currentYear = new Date().getFullYear();

  const totalCount = (
    await db
      .select({ count: count() })
      .from(invoices)
      .where(sql`YEAR(${invoices.createdAt}) = ${currentYear}`)
  )[0]!.count;

  const nextNumber = totalCount + 1;

  return `INV-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
};

// export const createInvoice = async (payload: InvoiceInput) => {
//   const invoiceId = await db
//     .insert(invoices)
//     .values({
//       ...payload,
//       date: new Date(payload.date),
//     })
//     .$returningId();
//   return invoiceId;
// };

export const createInvoice = async (payload: InvoiceInput) => {
  const invoiceNo = await generateInvoiceNumber();

  const transactionsData = await db
    .select()
    .from(transactions)
    .where(inArray(transactions.id, payload.transactionIds));

  if (transactionsData.length === 0) {
    throw new Error('No valid transactions found.');
  }

  const subtotal = transactionsData.reduce(
    (sum, trx) => sum + Number(trx.subtotal),
    0
  );
  const taxAmount = transactionsData.reduce(
    (sum, trx) => sum + Number(trx.taxAmount),
    0
  );
  const stampDuty = transactionsData.reduce(
    (sum, trx) => sum + Number(trx.stampDuty),
    0
  );

  const grandTotal = subtotal + taxAmount + stampDuty;

  const createdInvoice = await db
    .insert(invoices)
    .values({
      invoiceNo,
      date: payload.date,
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      stampDuty: stampDuty.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      customerId: payload.customerId,
      description: payload.description,
    })
    .returning();

  if (!createdInvoice[0]) {
    throw new Error('Failed to create invoice');
  }

  await db.insert(invoiceTransactions).values(
    payload.transactionIds.map((transactionId) => ({
      invoiceId: Number(createdInvoice[0]!.id),
      transactionId: Number(transactionId),
    }))
  );

  await db
    .update(transactions)
    .set({
      status: 'invoiced',
    })
    .where(inArray(transactions.id, payload.transactionIds));

  return { invoiceNo };
};

export const getInvoices = async (
  query: Partial<Invoice> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(invoices, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.invoices.findMany({
    limit,
    offset,
    where: whereClause,
    with: {
      customer: {
        columns: {
          name: true,
        },
      },
    },
  });

  const total =
    (await db.select({ count: count() }).from(invoices).where(whereClause))[0]
      ?.count ?? 0;

  return {
    data,
    pagination: {
      total_page: Math.ceil(Number(total) / limit),
      total: Number(total),
      current_page: page,
    },
  };
};

export const getInvoice = async (id: number) => {
  const result = await db.query.invoices.findFirst({
    where: eq(invoices.id, id),
    with: {
      customer: {
        columns: {
          name: true,
        },
      },
    },
  });

  return result;
};

export const updateInvoice = async (id: number, payload: InvoiceUpdate) => {
  return db
    .update(invoices)
    .set({
      ...payload,
      date: payload?.date || undefined,
    })
    .where(eq(invoices.id, id));
};

export const deleteInvoice = async (id: number) => {
  return db.delete(invoices).where(eq(invoices.id, id));
};

export const deleteAllInvoices = async () => {
  return db.delete(invoices);
};

// ** //

export const getOutstandingInvoiceByNumber = async (invoiceNo: string) => {
  const invoice = await db
    .select({
      invoiceId: invoices.id,
      invoiceNo: invoices.invoiceNo,
      date: invoices.date,
      grandTotal: invoices.grandTotal,
      totalPaid: sql`COALESCE(SUM(${paymentInvoices.amountPaid}), 0)`.as(
        'totalPaid'
      ),
    })
    .from(invoices)
    .leftJoin(paymentInvoices, eq(invoices.id, paymentInvoices.invoiceId))
    .where(eq(invoices.invoiceNo, invoiceNo))
    .groupBy(invoices.id)
    .then((res) => res[0]);

  if (!invoice) {
    return { status: 'not_found', message: 'Invoice not found' };
  }

  const grandTotal = Number(invoice.grandTotal ?? 0);
  const totalPaid = Number(invoice.totalPaid ?? 0);
  const outstanding = grandTotal - totalPaid;

  if (outstanding <= 0) {
    return { status: 'fully_paid', message: 'Invoice is already fully paid' };
  }

  return {
    invoiceId: invoice.invoiceId,
    invoiceNo: invoice.invoiceNo,
    date: invoice.date,
    grandTotal: grandTotal.toFixed(2),
    totalPaid: totalPaid.toFixed(2),
    outstanding: outstanding.toFixed(2),
  };
};
