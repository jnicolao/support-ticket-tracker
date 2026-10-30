import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { pool } from '../src/db';
import { migrate } from '../src/migrator';

describe('migrations', () => {
  it('records every migration file once and applies nothing on a second run', async () => {
    const files = (await readdir(path.join(__dirname, '../db/migrations')))
      .filter((file) => file.endsWith('.sql'))
      .sort();
    expect(files.length).toBeGreaterThan(0);

    const { rows } = await pool.query<{ name: string }>(
      'SELECT name FROM schema_migrations ORDER BY name',
    );
    expect(rows.map((row) => row.name)).toEqual(files);

    expect(await migrate()).toEqual([]);
  });
});
