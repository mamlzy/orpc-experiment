import * as fs from 'fs/promises';
import { PgTable } from 'drizzle-orm/pg-core';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ZodBoolean, ZodDate, ZodNumber, ZodObject, ZodSchema } from 'zod';

import type { InferInsertModel } from '@repo/db';
import { db } from '@repo/db';

import { deleteFile, moveToFailed, saveFile } from './file-upload';

const cleanHeaders = (headers: string[]): string[] =>
  headers.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));

const isZodObject = (schema: ZodSchema<any>): schema is ZodObject<any> =>
  schema instanceof ZodObject;

const parseExcel = async <T>(
  filePath: string,
  schema: ZodSchema<T>
): Promise<T[]> => {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0] ?? ''];
  if (!sheet) throw new Error('Sheet not found');
  let rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: null,
  });

  if (rows.length && isZodObject(schema)) {
    const firstRow = rows[0] as Record<string, any>;
    const headers = cleanHeaders(Object.keys(firstRow));
    rows = rows.map((row) =>
      Object.fromEntries(
        headers.map((h, i) => {
          let value = Object.values(row)[i];
          const expectedType = schema.shape[h];

          if (expectedType instanceof ZodNumber && typeof value === 'string')
            value = Number(value.replace(/,/g, '').trim());
          else if (expectedType instanceof ZodDate && typeof value === 'string')
            value = new Date(value);
          else if (expectedType instanceof ZodBoolean)
            value = value === 'true' || value === '1';

          return [h, value];
        })
      )
    );
  }

  return rows as T[];
};

interface BulkInsertOptions<T> {
  table: PgTable<any>;
  schema: ZodSchema<T>;
}

export const bulkInsert = async <T>(
  file: File,
  { table, schema }: BulkInsertOptions<T>
) => {
  const folderPath = `./src/public/uploads/bulk_temp`;
  const { path: filePath } = await saveFile(file, folderPath);

  try {
    let rows: T[] = [];
    if (file.name.endsWith('.csv')) {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      rows = Papa.parse<T>(fileContent, {
        header: true,
        skipEmptyLines: true,
      }).data;
    } else if (file.name.endsWith('.xlsx')) {
      rows = await parseExcel(filePath, schema);
    } else {
      throw new Error(
        'Unsupported file format. Only CSV and Excel are allowed.'
      );
    }

    const validData: InferInsertModel<typeof table>[] = rows
      .map((row) => {
        try {
          const cleanedRow = Object.fromEntries(
            Object.entries(row as Record<string, any>).map(([key, value]) => [
              key,
              value === '' || value === "''" ? null : value,
            ])
          );

          const finalRow = {
            ...cleanedRow,
          };

          // return schema.parse(finalRow) as InferInsertModel<typeof table>;
          return finalRow;
        } catch {
          return undefined;
        }
      })
      .filter(
        (row): row is InferInsertModel<typeof table> => row !== undefined
      );

    if (!validData.length) throw new Error('No valid data to insert.');

    await db.insert(table).values(validData);
    await deleteFile(filePath);

    return {
      success: true,
      message: 'Bulk insert successful',
      count: validData.length,
    };
  } catch (error) {
    console.error('Bulk insert error:', error);
    await moveToFailed(filePath);
    throw new Error('Bulk insert failed');
  }
};

export const bulkInsertCustomerPIC = async <T>(
  file: File,
  { table, schema }: BulkInsertOptions<T>
) => {
  const folderPath = `./src/public/uploads/bulk_temp`;
  const { path: filePath } = await saveFile(file, folderPath);

  try {
    const customers = await db.query.customerTable.findMany();
    const customerMap = new Map(
      customers.map((c) => [c.name?.toLowerCase(), c.id])
    );
    console.log(customers);

    let rows: T[] = [];
    if (file.name.endsWith('.csv')) {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      rows = Papa.parse<T>(fileContent, {
        header: true,
        skipEmptyLines: true,
      }).data;
    } else if (file.name.endsWith('.xlsx')) {
      rows = await parseExcel(filePath, schema);
    } else {
      throw new Error(
        'Unsupported file format. Only CSV and Excel are allowed.'
      );
    }

    const validData: InferInsertModel<typeof table>[] = rows
      .map((row) => {
        try {
          const cleanedRow = Object.fromEntries(
            Object.entries(row as Record<string, any>).map(([key, value]) => [
              key,
              value === '' || value === "''" ? null : value,
            ])
          );

          const name = cleanedRow.customerName?.toLowerCase();
          if (!name || !customerMap.has(name)) {
            console.warn(`Customer not found: ${name}`);
            return undefined;
          }

          delete cleanedRow.customer_name;

          if (cleanedRow.pic_name == null) {
            cleanedRow.pic_name = '-';
          }

          const finalRow = {
            ...cleanedRow,
            customerId: customerMap.get(name),
          };

          return schema.parse(finalRow) as InferInsertModel<typeof table>;
        } catch {
          return undefined;
        }
      })
      .filter(
        (row): row is InferInsertModel<typeof table> => row !== undefined
      );

    if (!validData.length) throw new Error('No valid data to insert.');

    await db.insert(table).values(validData);
    await deleteFile(filePath);

    return {
      success: true,
      message: 'Bulk insert successful',
      count: validData.length,
    };
  } catch (error) {
    console.error('Bulk insert error:', error);
    await moveToFailed(filePath);
    throw new Error('Bulk insert failed');
  }
};
