import type { Option } from '@/types';

import type { InvoiceTypeEnum } from '@repo/db/model';

export const invoiceTypeOptions: Option<InvoiceTypeEnum>[] = [
  {
    value: 'DOWN_PAYMENT',
    label: 'Down Payment',
  },
  {
    value: 'PARTIAL_PAYMENT',
    label: 'Partial Payment',
  },
  {
    value: 'FINAL_PAYMENT',
    label: 'Final Payment',
  },
  {
    value: 'FULL_PAYMENT',
    label: 'Full Payment',
  },
];

export const materaiOptions = [
  {
    value: '0',
    label: 'No',
  },
  {
    value: '10000',
    label: 'Yes',
  },
] as const satisfies Option<string>[];

export const ppnOptions = [
  {
    value: 'no',
    label: 'No',
  },
  {
    value: 'yes',
    label: 'Yes',
  },
] as const satisfies Option<string>[];

export type PpnOptionValue = (typeof ppnOptions)[number]['value'];
