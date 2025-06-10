import { db, sql } from '@repo/db';

export async function softDelete(table: string, id: number) {
  await db.execute(
    sql.raw(`UPDATE \`${table}\` SET deleted_at = NOW() WHERE id = ${id};`)
  );
}

export async function restore(table: string, id: number) {
  await db.execute(
    sql`UPDATE \`${table}\` SET deleted_at = NULL WHERE id = ${id};`
  );
}

export async function getActiveRecords(table: string) {
  return db.execute(sql`SELECT * FROM \`${table}\` WHERE deleted_at IS NULL;`);
}

export async function getDeletedRecords(table: string) {
  return db.execute(
    sql`SELECT * FROM \`${table}\` WHERE deleted_at IS NOT NULL;`
  );
}
