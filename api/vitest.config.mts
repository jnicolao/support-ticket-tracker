import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        'postgres://postgres:postgres@localhost:5432/tickets_test',
    },
    fileParallelism: false,
    setupFiles: ['tests/setup.ts'],
  },
});
