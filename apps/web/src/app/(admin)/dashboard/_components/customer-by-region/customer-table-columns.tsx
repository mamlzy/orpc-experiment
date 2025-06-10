import { createColumnHelper } from '@tanstack/react-table';

import { type Outputs } from '@/lib/orpc';

const columnHelper =
  createColumnHelper<
    Outputs['masterData']['customer']['getAll']['data'][number]
  >();

export const columns = [
  columnHelper.accessor('id', {
    header: () => 'ID',
  }),
  columnHelper.accessor('name', {
    header: () => 'Name',
  }),
  columnHelper.accessor('businessEntity', {
    header: () => 'Business Entity',
  }),
  columnHelper.accessor('telephone', {
    header: () => 'Telephone',
  }),
  columnHelper.accessor('email', {
    header: () => 'Email',
  }),
  columnHelper.accessor('status', {
    header: () => 'Status',
  }),
];
