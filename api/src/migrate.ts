import 'dotenv/config';
import { migrate, pool } from './db';

migrate()
  .then(() => console.log('Schema applied'))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
