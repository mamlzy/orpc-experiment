import type { Logger } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as model from './model';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class QueryLogger implements Logger {
  // eslint-disable-next-line class-methods-use-this
  logQuery(query: string, params: unknown[]): void {
    console.debug('___QUERY___');
    console.debug(query);
    console.debug(params);
    console.debug('___END_QUERY___');
  }
}

const client = postgres(process.env.DATABASE_URL!);

// export const db = drizzle(process.env.DATABASE_URL!, {
export const db = drizzle({
  client,
  schema: model,
  casing: 'snake_case',
  // logger: new QueryLogger(),
});

export * from 'drizzle-orm';
