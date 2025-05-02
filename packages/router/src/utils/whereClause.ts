import { eq, like, SQL } from '@repo/db';

export const buildWhereClause = <T extends Record<string, any>>(
  table: T,
  filters: Partial<Record<keyof T, any>>
): SQL[] => {
  return Object.entries(filters)
    .filter(
      ([_key, value]) => value !== undefined && value !== null && value !== ''
    )
    .map(([key, value]) =>
      typeof table[key] !== 'undefined'
        ? typeof value === 'string'
          ? like(table[key], `%${value}%`)
          : eq(table[key], value)
        : []
    )
    .filter(Boolean) as SQL[];
};
