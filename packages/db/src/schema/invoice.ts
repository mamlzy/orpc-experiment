import { z } from 'zod';

import { invoiceStatusEnum, invoiceTypeEnum } from '../model/invoice';

const optionalStrinDData = z.string().nullable().optional();

const decimalString = ({ gt }: { gt?: number } = {}) =>
  z.preprocess(
    (val) => (typeof val === 'number' ? val.toString() : val),
    z.string().refine(
      (val) => {
        const num = parseFloat(val);
        if (Number.isNaN(num)) return false;
        if (gt === undefined) return true;
        return num > gt;
      },
      {
        message:
          gt !== undefined
            ? `Value must be greater than ${gt}`
            : 'Must be a valid decimal number',
      }
    )
  );

export const createInvoiceSchema = z.object({
  date: z.string(),
  dueDate: z.string(),
  customerId: z.string(),
  transactionId: z.string(),
  type: z.enum(invoiceTypeEnum.enumValues).default('DOWN_PAYMENT'),
  percentage: decimalString({ gt: 0 }).optional(),
  subtotal: decimalString().optional(),
  taxAmount: decimalString().optional(),
  stampDuty: decimalString().optional(),
  grandTotal: decimalString().optional(),
  bankId: optionalStrinDData,
  status: z.enum(invoiceStatusEnum.enumValues).default('UNPAID'),
  description: optionalStrinDData,
});

export const createInvoicesSchema = createInvoiceSchema
  .extend({
    invoiceNo: z.string(),
  })
  .array();

export const updateInvoiceSchema = z.object({
  date: optionalStrinDData,
  dueDate: optionalStrinDData,
  customerId: optionalStrinDData,
  transactionId: z.string(),
  type: z.enum(invoiceTypeEnum.enumValues).optional(),
  percentage: decimalString({ gt: 0 }).optional(),
  subtotal: decimalString().optional(),
  taxAmount: decimalString().optional(),
  stampDuty: decimalString().optional(),
  grandTotal: decimalString().optional(),
  bankId: optionalStrinDData,
  status: z.enum(invoiceStatusEnum.enumValues).optional(),
  description: optionalStrinDData,
});

export type CreateInvoiceSchema = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceSchema = z.infer<typeof updateInvoiceSchema>;
