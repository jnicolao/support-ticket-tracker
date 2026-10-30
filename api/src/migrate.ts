import 'dotenv/config';
import { pool } from './db';
import { migrate } from './migrator';

migrate()
  .then((applied) => {
    if (applied.length === 0) {
      console.log('No pending migrations');
    }
    for (const name of applied) {
      console.log(`Applied ${name}`);
    }
  })
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
