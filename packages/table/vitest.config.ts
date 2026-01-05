import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    // Windows: avoid occasional worker-thread heap OOM in CI/local runs.
    pool: 'forks',
  },
});
