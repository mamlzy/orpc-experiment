import type { AnyColumn } from 'drizzle-orm/column';
import stringSimilarity from 'string-similarity';

import { db, SQL, Table } from '@repo/db';

export interface SimilarMatch {
  target: string;
  rating: number;
}

interface CheckSimilarOptions {
  table: Table;
  column: AnyColumn;
  input: string;
  threshold?: number;
}

export async function checkSimilarRecord({
  table,
  column,
  input,
  threshold = 0.7,
}: CheckSimilarOptions): Promise<SimilarMatch[]> {
  const col = column as unknown as SQL<unknown>;
  const results = await db.select({ value: col }).from(table);

  const values = results.map((row) => row.value as string);

  const matches = stringSimilarity.findBestMatch(input, values);

  const similar = matches.ratings
    .filter((r) => r.rating >= threshold)
    .sort((a, b) => b.rating - a.rating);

  return similar;
}
