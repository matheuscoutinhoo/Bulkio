import { defineConfig } from 'vitest/config';
import path from 'path';

const TEST_DB_PATH = path.resolve(__dirname, 'prisma', 'test.db');

export default defineConfig({
   test: {
      globals: true,
      environment: 'node',
      include: ['src/tests/integration/**/*.integration.test.ts'],
      testTimeout: 30000,
      hookTimeout: 30000,
      fileParallelism: false,
      env: {
         DATABASE_URL: `file:${TEST_DB_PATH}`,
         NODE_ENV: 'test',
      },
   },
});
