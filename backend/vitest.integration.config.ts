import { defineConfig } from 'vitest/config';

export default defineConfig({
   test: {
      globals: true,
      environment: 'node',
      include: ['src/tests/integration/**/*.integration.test.ts'],
      testTimeout: 30000,
      hookTimeout: 30000,
      fileParallelism: false,
      env: {
         DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bulkio_test?schema=public',
         NODE_ENV: 'test',
      },
   },
});
