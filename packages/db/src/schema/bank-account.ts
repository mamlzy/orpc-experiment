import { z } from 'zod';

export const createBankAccountSchema = z.object({
  bankName: z.string(),
  accountName: z.string(),
  accountNumber: z.string(),
  isActive: z.boolean().optional().default(true),
});

export const updateBankAccountSchema = z.object({
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type BankAccountInput = z.infer<typeof createBankAccountSchema>;
export type BankAccountUpdate = z.infer<typeof updateBankAccountSchema>;
