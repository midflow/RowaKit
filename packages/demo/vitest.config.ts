import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/harness/**/*.test.ts', 'src/harness/**/*.test.tsx'],
    exclude: ['**/runner.ui.test.ts', '**/debug.test.tsx'], // Exclude runner and debug tests
    setupFiles: ['./vitest.setup.ts'],
    // Ensure cleanup between tests
    restoreMocks: true,
    clearMocks: true,
    // Run tests sequentially to avoid timing issues
    threads: false,
    // Isolate modules between test files for better isolation
    isolate: true,
  },
});
