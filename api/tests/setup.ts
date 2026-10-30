import { afterAll, beforeAll, beforeEach } from 'vitest';
import { pool } from '../src/db';
import { migrate } from '../src/migrator';

if (!process.env.DATABASE_URL?.endsWith('_test')) {
  throw new Error('Refusing to run tests: DATABASE_URL must point at a database ending in _test');
}

beforeAll(() => migrate());
beforeEach(() => pool.query('TRUNCATE tickets RESTART IDENTITY'));
afterAll(() => pool.end());
