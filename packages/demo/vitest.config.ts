import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/harness/**/*.test.ts', 'src/harness/**/*.test.tsx'],
    setupFiles: ['./vitest.setup.ts'],
    // Ensure cleanup between tests
    restoreMocks: true,
    clearMocks: true,
    // Run tests sequentially to avoid timing issues
    threads: false,
  },
});
