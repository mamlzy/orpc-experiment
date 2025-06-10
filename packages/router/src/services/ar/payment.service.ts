import { and, count, db, eq, inArray, sql } from '@repo/db';
import {
  invoiceTable,
  paymentInvoiceTable,
  paymentTable,
} from '@repo/db/model';

import { buildWhereClause } from '../../utils/where-clause';

type Payment = typeof paymentTable.$inferSelect;

export const generatePaymentNumber = async () => {
  const currentYear = new Date().getFullYear();

  const existingCount =
    (
      await db
        .select({ count: count() })
        .from(paymentTable)
        .where(
          sql`EXTRACT(YEAR FROM ${paymentTable.createdAt}) = ${currentYear}`
        )
    )[0]?.count ?? 0;

  const nextNumber = existingCount + 1;

  return `PAY-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
};

export const createPayment = async (payload: any) => {
  const paymentNo = await generatePaymentNumber();

  // **Insert payments**
  const createdPayment = await db
    .insert(paymentTable)
    .values({
      paymentNumber: paymentNo,
      date: payload.date,
      customerId: payload.customerId,
      paymentMethod: payload.paymentMethod,
      bankAccount: payload.bankAccount ?? null,
      bankNumber: payload.bankNumber ?? null,
      totalPaid: payload.totalPaid.toFixed(2),
    })
    .returning();

  const [payment] = createdPayment;
  if (!payment) {
    throw new Error('Failed to create payment');
  }

  await db.insert(paymentInvoiceTable).values(
    payload.items.map((item: any) => ({
      paymentId: payment.id,
      invoiceId: item.invoiceId,
      amountPaid: item.amountPaid.toFixed(2),
    }))
  );

  // **Get total paid for each invoice**
  const invoicePayments = await db
    .select({
      invoiceId: paymentInvoiceTable.invoiceId,
      totalPaid: sql`SUM(${paymentInvoiceTable.amountPaid})`.as('totalPaid'),
    })
    .from(paymentInvoiceTable)
    .where(
      inArray(
        paymentInvoiceTable.invoiceId,
        payload.items.map((item: any) => item.invoiceId)
      )
    )
    .groupBy(paymentInvoiceTable.invoiceId);

  // **Update status invoice**
  for (const { invoiceId, totalPaid } of invoicePayments) {
    const invoice = await db
      .select({ grandTotal: invoiceTable.grandTotal })
      .from(invoiceTable)
      .where(eq(invoiceTable.id, invoiceId!))
      .then((res) => res[0]);

    // eslint-disable-next-line no-continue
    if (!invoice) continue;

    const status =
      Number(totalPaid) >= Number(invoice.grandTotal)
        ? 'PAID'
        : 'PARTIALLY_PAID';

    await db
      .update(invoiceTable)
      .set({ status: sql.raw(`'${status}'`) })
      .where(eq(invoiceTable.id, invoiceId!));
  }

  return payment;
};

export const getPayments = async (
  query: Partial<Payment> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(paymentTable, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.paymentTable.findMany({
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

  const total = (
    await db.select({ count: count() }).from(paymentTable).where(whereClause)
  )[0]?.count;

  return {
    data,
    pagination: {
      total_page: Math.ceil(Number(total) / limit),
      total: Number(total),
      current_page: page,
    },
  };
};

export const getPayment = async (id: string) => {
  const result = await db.query.paymentTable.findFirst({
    where: eq(paymentTable.id, id),
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

export const updatePayment = async (_id: string, _payload: any) => {};

export const deletePayment = async (id: string) => {
  return db.delete(paymentTable).where(eq(paymentTable.id, id));
};

export const deleteAllPayments = async () => {
  return db.delete(paymentTable);
};
