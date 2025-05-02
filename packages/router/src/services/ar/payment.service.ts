import { and, count, db, eq, inArray, sql } from '@repo/db';
import { invoices, paymentInvoices, payments } from '@repo/db/model';
import type { PaymentInput } from '@repo/db/schema';

import { buildWhereClause } from '../../utils/whereClause';

type Payment = typeof payments.$inferSelect;

export const generatePaymentNumber = async () => {
  const currentYear = new Date().getFullYear();

  const existingCount =
    (
      await db
        .select({ count: count() })
        .from(payments)
        .where(sql`YEAR(${payments.createdAt}) = ${currentYear}`)
    )[0]?.count ?? 0;

  const nextNumber = existingCount + 1;

  return `PAY-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
};

export const createPayment = async (payload: PaymentInput) => {
  const paymentNo = await generatePaymentNumber();

  // **Insert payments**
  const createdPayment = await db
    .insert(payments)
    .values({
      paymentNumber: paymentNo,
      date: payload.date,
      customerId: payload.customerId,
      paymentMethod: payload.paymentMethod,
      totalPaid: payload.totalPaid.toFixed(2),
    })
    .returning();

  const [payment] = createdPayment;
  if (!payment) {
    throw new Error('Failed to create payment');
  }

  await db.insert(paymentInvoices).values(
    payload.items.map((item) => ({
      paymentId: payment.id,
      invoiceId: item.invoiceId,
      amountPaid: item.amountPaid.toFixed(2),
    }))
  );

  // **Get total paid for each invoice**
  const invoicePayments = await db
    .select({
      invoiceId: paymentInvoices.invoiceId,
      totalPaid: sql`SUM(${paymentInvoices.amountPaid})`.as('totalPaid'),
    })
    .from(paymentInvoices)
    .where(
      inArray(
        paymentInvoices.invoiceId,
        payload.items.map((item) => item.invoiceId)
      )
    )
    .groupBy(paymentInvoices.invoiceId);

  // **Update status invoice**
  for (const { invoiceId, totalPaid } of invoicePayments) {
    const invoice = await db
      .select({ grandTotal: invoices.grandTotal })
      .from(invoices)
      .where(eq(invoices.id, Number(invoiceId)))
      .then((res) => res[0]);

    // eslint-disable-next-line no-continue
    if (!invoice) continue;

    const status =
      Number(totalPaid) >= Number(invoice.grandTotal)
        ? 'paid'
        : 'partially paid';

    await db
      .update(invoices)
      .set({ status: sql.raw(`'${status}'`) })
      .where(eq(invoices.id, Number(invoiceId)));
  }

  return payment.id;
};

export const getPayments = async (
  query: Partial<Payment> & { page?: number; limit?: number }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const whereConditions = buildWhereClause(payments, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.payments.findMany({
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
    await db.select({ count: count() }).from(payments).where(whereClause)
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

export const getPayment = async (id: number) => {
  const result = await db.query.payments.findFirst({
    where: eq(payments.id, id),
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

export const updatePayment = async (_id: number, _payload: any) => {};

export const deletePayment = async (id: number) => {
  return db.delete(payments).where(eq(payments.id, id));
};

export const deleteAllPayments = async () => {
  return db.delete(payments);
};
