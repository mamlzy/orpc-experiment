import { os } from '@orpc/server';

import type { HonoContext } from '../types';

// Pre-configured os instance with default context
export const osHono = os.$context<{ c: HonoContext }>();
