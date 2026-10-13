import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function migrate() {
  const sql = await readFile(path.join(__dirname, '../db/schema.sql'), 'utf8');
  await pool.query(sql);
}
