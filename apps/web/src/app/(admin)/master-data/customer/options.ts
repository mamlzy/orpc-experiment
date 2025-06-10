import type { Option } from '@/types';

import type {
  CustomerBusinessEntityEnum,
  CustomerStatusEnum,
  CustomerTypeEnum,
} from '@repo/db/model';

export const businessEntityOptions: Option<CustomerBusinessEntityEnum>[] = [
  {
    value: 'PT',
    label: 'PT',
  },
  {
    value: 'CV',
    label: 'CV',
  },
  {
    value: 'UD',
    label: 'UD',
  },
  {
    value: 'FIRM',
    label: 'Firm',
  },
  {
    value: 'KOPERASI',
    label: 'Koperasi',
  },
  {
    value: 'YAYASAN',
    label: 'Yayasan',
  },
  {
    value: 'PERORANGAN',
    label: 'Perorangan',
  },
  {
    value: 'BUMN',
    label: 'BUMN',
  },
  {
    value: 'BUMS',
    label: 'BUMS',
  },
  {
    value: 'BUPD',
    label: 'BUPD',
  },
  {
    value: 'LAINNYA',
    label: 'Lainnya',
  },
];

export const customerTypeOptions: Option<CustomerTypeEnum>[] = [
  {
    value: 'INTERNATIONAL',
    label: 'International',
  },
  {
    value: 'DOMESTIC',
    label: 'Domestic',
  },
];

export const customerStatusOptions: Option<CustomerStatusEnum>[] = [
  {
    value: 'ACTIVE',
    label: 'Active',
  },
  {
    value: 'INACTIVE',
    label: 'Inactive',
  },
  {
    value: 'BANK_DATA',
    label: 'Bank Data',
  },
];
