import { and, count, db, eq, inArray, sql } from '@repo/db';
import {
  invoiceTable,
  invoiceTransactionTable,
  paymentInvoiceTable,
  transactionTable,
} from '@repo/db/model';

import { buildWhereClause } from '../../utils/where-clause';

type Invoice = typeof invoiceTable.$inferSelect;

export const generateInvoiceNumber = async () => {
  const currentYear = new Date().getFullYear();

  const totalCount = (
    await db
      .select({ count: count() })
      .from(invoiceTable)
      .where(sql`EXTRACT(YEAR FROM ${invoiceTable.createdAt}) = ${currentYear}`)
  )[0]!.count;

  const nextNumber = totalCount + 1;

  return `INV-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
};

export const createInvoiceMultipleUnused = async (payload: any) => {
  const invoiceNo = await generateInvoiceNumber();

  const transactionsData = await db
    .select()
    .from(transactionTable)
    .where(inArray(transactionTable.id, payload.transactionId));

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

  const [invoiceData] = await db
    .insert(invoiceTable)
    .values({
      invoiceNo,
      date: payload.date,
      dueDate: payload.dueDate,
      customerId: payload.customerId,
      type: payload.type.toUpperCase(),
      percentage: payload.percentage,
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      stampDuty: stampDuty.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      bankId: payload.bankId,
      status: 'UNPAID',
      description: payload.description,
    })
    .returning({ id: invoiceTable.id });

  await db.insert(invoiceTransactionTable).values(
    payload.transactionId.map((transactionId: string) => ({
      invoiceId: invoiceData?.id,
      transactionId,
    }))
  );

  await db
    .update(transactionTable)
    .set({
      status: 'PARTIALLY_INVOICED',
    })
    .where(inArray(transactionTable.id, payload.transactionId));

  return { invoiceNo };
};

export const createInvoice = async (payload: any) => {
  const invoiceNo = await generateInvoiceNumber();

  const transactionData = await db.query.transactionTable.findFirst({
    where: and(
      eq(transactionTable.id, payload.transactionId),
      eq(transactionTable.status, 'PENDING')
    ),
  });

  if (!transactionData) {
    throw new Error('No valid transactions found.');
  }
  const dpp = (11 / 12) * payload.subtotal;
  const taxAmount = ((payload.taxRate ?? 12) / 100) * dpp;

  const createdInvoice = await db.insert(invoiceTable).values({
    invoiceNo,
    date: payload.date,
    dueDate: payload.dueDate,
    customerId: payload.customerId,
    transactionId: payload.transactionId,
    type: payload.type.toUpperCase(),
    percentage: payload.percentage,
    subtotal: payload.subtotal,
    dpp: dpp.toFixed(2),
    taxRate: payload.taxRate ?? 12,
    taxAmount: taxAmount.toFixed(2),
    stampDuty: payload.stampDuty,
    grandTotal: payload.grandTotal,
    bankId: payload.bankId,
    status: 'UNPAID',
    description: payload.description,
  });

  if (!createdInvoice) {
    throw new Error('Failed to create invoice');
  }

  await db
    .update(transactionTable)
    .set({
      status: 'PARTIALLY_INVOICED',
    })
    .where(eq(transactionTable.id, payload.transactionId));

  return { invoiceNo };
};

export const getInvoices = async (
  query: Partial<Invoice> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(invoiceTable, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.invoiceTable.findMany({
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
    (
      await db.select({ count: count() }).from(invoiceTable).where(whereClause)
    )[0]?.count ?? 0;

  return {
    data,
    pagination: {
      total_page: Math.ceil(Number(total) / limit),
      total: Number(total),
      current_page: page,
    },
  };
};

export const getInvoice = async (id: string) => {
  const result = await db.query.invoiceTable.findFirst({
    where: eq(invoiceTable.id, id),
    with: {
      customer: {
        columns: {
          name: true,
        },
      },
      bankAccount: {
        columns: {
          bankName: true,
          accountName: true,
          accountNumber: true,
        },
      },
      transaction: {
        columns: {
          id: true,
          marketingId: true,
          customerId: true,
          subtotal: true,
          taxAmount: true,
          stampDuty: true,
          grandTotal: true,
        },
        with: {
          items: {
            columns: {
              id: true,
              productId: true,
              qty: true,
              price: true,
            },
            with: {
              product: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return result;
};

export const updateInvoice = async (id: string, payload: any) => {
  return db
    .update(invoiceTable)
    .set({
      ...payload,
      date: payload?.date || undefined,
    })
    .where(eq(invoiceTable.id, id));
};

export const deleteInvoice = async (id: string) => {
  return db.delete(invoiceTable).where(eq(invoiceTable.id, id));
};

export const deleteAllInvoices = async () => {
  return db.delete(invoiceTable);
};

// ** //

export const getOutstandingInvoiceByNumber = async (invoiceNo: string) => {
  const invoice = await db
    .select({
      invoiceId: invoiceTable.id,
      invoiceNo: invoiceTable.invoiceNo,
      date: invoiceTable.date,
      grandTotal: invoiceTable.grandTotal,
      totalPaid: sql`COALESCE(SUM(${paymentInvoiceTable.amountPaid}), 0)`.as(
        'totalPaid'
      ),
    })
    .from(invoiceTable)
    .leftJoin(
      paymentInvoiceTable,
      eq(invoiceTable.id, paymentInvoiceTable.invoiceId)
    )
    .where(eq(invoiceTable.invoiceNo, invoiceNo))
    .groupBy(invoiceTable.id)
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
