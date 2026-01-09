import { defineConfig } from 'vitest/config';
import { readFileSync } from 'fs';
import { join } from 'path';

const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8')) as { version: string };

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    // Windows: avoid occasional worker-thread heap OOM in CI/local runs.
    pool: 'forks',
    define: {
      __ROWAKIT_TABLE_VERSION__: JSON.stringify(pkg.version),
    },
  },
});
