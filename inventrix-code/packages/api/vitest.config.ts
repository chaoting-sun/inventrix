import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    // The PostgreSQL test files share one database, so they run one file at a time.
    fileParallelism: false
  }
});
