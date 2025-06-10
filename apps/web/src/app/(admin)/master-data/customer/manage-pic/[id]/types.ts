import type { Outputs } from '@/lib/orpc';

export type CustomerOutput =
  Outputs['masterData']['customerPic']['getAll']['data'][number];
